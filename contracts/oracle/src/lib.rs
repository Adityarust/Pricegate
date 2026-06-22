#![no_std]

/// PriceGate Oracle Contract
///
/// A thin wrapper around the Reflector Protocol's deployed testnet Pulse oracle.
/// Normalizes prices to 7 decimal places and exposes a simple `get_price(asset) → i128`
/// interface for use by the escrow contract via cross-contract calls.
///
/// ## Price Format
///
/// All prices returned by this contract use **7 decimal places**.
/// For example, XLM at $0.12 is represented as `1_200_000` (0.12 × 10^7).
///
/// ## Initialization
///
/// Before calling `get_price`, the contract must be initialized with:
/// - `admin`: the account that deployed the contract
/// - `reflector_address`: the deployed Reflector Pulse oracle address on the network

mod reflector;

use reflector::{Asset as ReflectorAsset, ReflectorPulseClient};
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, log, Address, Env, Symbol,
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/// Number of decimal places in prices returned by this contract.
/// Reflector typically uses 14; we normalize down to 7 for simpler math.
const PRICE_DECIMALS: u32 = 7;

/// TTL bump for instance storage (~30 days at 5s/ledger).
const INSTANCE_BUMP_AMOUNT: u32 = 518_400;

/// TTL threshold to trigger a bump (~7 days).
const INSTANCE_LIFETIME_THRESHOLD: u32 = 120_960;

// ---------------------------------------------------------------------------
// Storage keys
// ---------------------------------------------------------------------------

#[contracttype]
enum DataKey {
    /// Admin address (set once during initialization)
    Admin,
    /// Address of the deployed Reflector Pulse oracle contract
    Reflector,
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum OracleError {
    /// Contract has already been initialized
    AlreadyInitialized = 1,
    /// Contract has not been initialized yet
    NotInitialized = 2,
    /// Reflector oracle returned no price for the requested asset
    PriceNotAvailable = 3,
}

// ---------------------------------------------------------------------------
// Contract
// ---------------------------------------------------------------------------

#[contract]
pub struct OracleContract;

#[contractimpl]
impl OracleContract {
    /// Initialize the oracle contract.
    ///
    /// Must be called exactly once before any other function.
    ///
    /// # Arguments
    /// * `admin` — the deployer/admin address
    /// * `reflector_address` — address of the Reflector Pulse oracle on this network
    pub fn initialize(
        env: Env,
        admin: Address,
        reflector_address: Address,
    ) -> Result<(), OracleError> {
        // Prevent double initialization
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(OracleError::AlreadyInitialized);
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::Reflector, &reflector_address);

        log!(&env, "PriceGate Oracle initialized");
        Ok(())
    }

    /// Get the latest price for an asset, normalized to 7 decimal places.
    ///
    /// Calls the Reflector Pulse oracle's `lastprice()` function via cross-contract
    /// invocation, then normalizes the result from Reflector's decimal precision
    /// (typically 14) down to 7 decimal places.
    ///
    /// # Arguments
    /// * `asset` — asset symbol to query (e.g., Symbol for "XLM")
    ///
    /// # Returns
    /// Price as i128 with 7 decimal places.
    /// Example: XLM at $0.12 → `1_200_000`
    ///
    /// # Errors
    /// * `NotInitialized` — if `initialize()` hasn't been called
    /// * `PriceNotAvailable` — if Reflector has no price for the asset
    pub fn get_price(env: Env, asset: Symbol) -> Result<i128, OracleError> {
        // Load the Reflector oracle address
        let reflector_address: Address = env
            .storage()
            .instance()
            .get(&DataKey::Reflector)
            .ok_or(OracleError::NotInitialized)?;

        // Extend TTL on every read to keep the contract alive
        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        // Create Reflector Pulse client
        let client = ReflectorPulseClient::new(&env, &reflector_address);

        // Build the asset identifier for Reflector
        let ticker = ReflectorAsset::Other(asset.clone());

        // Fetch the latest price
        let price_data = client.lastprice(&ticker);

        match price_data {
            Some(data) => {
                // Query Reflector's decimal precision and normalize to PRICE_DECIMALS
                let reflector_decimals = client.decimals();
                let normalized = normalize_price(data.price, reflector_decimals, PRICE_DECIMALS);

                log!(
                    &env,
                    "PriceGate Oracle: asset price = {}, reflector_decimals = {}, normalized = {}",
                    data.price,
                    reflector_decimals,
                    normalized,
                );

                Ok(normalized)
            }
            None => {
                log!(&env, "PriceGate Oracle: price not available for asset");
                Err(OracleError::PriceNotAvailable)
            }
        }
    }

    /// Returns the number of decimal places used by this contract's prices.
    /// Always returns 7.
    pub fn decimals(_env: Env) -> u32 {
        PRICE_DECIMALS
    }

    /// Returns the stored Reflector oracle address.
    pub fn get_reflector_address(env: Env) -> Result<Address, OracleError> {
        env.storage()
            .instance()
            .get(&DataKey::Reflector)
            .ok_or(OracleError::NotInitialized)
    }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/// Normalize a price from `from_decimals` precision to `to_decimals` precision.
///
/// If `from_decimals > to_decimals`, divides (loses precision).
/// If `from_decimals < to_decimals`, multiplies (gains precision).
fn normalize_price(price: i128, from_decimals: u32, to_decimals: u32) -> i128 {
    if from_decimals > to_decimals {
        let scale = 10i128.pow(from_decimals - to_decimals);
        price / scale
    } else if from_decimals < to_decimals {
        let scale = 10i128.pow(to_decimals - from_decimals);
        price * scale
    } else {
        price
    }
}

#[cfg(test)]
mod test;
