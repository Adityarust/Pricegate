#![no_std]

//! PriceGate Oracle — thin wrapper around Reflector Pulse oracle.
//! Normalizes prices to 7 decimals for the escrow contract.

mod reflector;

use reflector::{Asset as ReflectorAsset, ReflectorPulseClient};
use soroban_sdk::{contract, contracterror, contractimpl, contracttype, log, Address, Env, Symbol};

const PRICE_DECIMALS: u32 = 7;
const INSTANCE_BUMP_AMOUNT: u32 = 518_400; // ~30 days
const INSTANCE_LIFETIME_THRESHOLD: u32 = 120_960; // ~7 days

#[contracttype]
enum DataKey {
    Admin,
    Reflector,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum OracleError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    PriceNotAvailable = 3,
}

#[contract]
pub struct OracleContract;

#[contractimpl]
impl OracleContract {
    pub fn initialize(
        env: Env,
        admin: Address,
        reflector_address: Address,
    ) -> Result<(), OracleError> {
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

    /// Fetches latest price from Reflector and normalizes to 7 decimal places.
    /// e.g. XLM at $0.12 → 1_200_000
    pub fn get_price(env: Env, asset: Symbol) -> Result<i128, OracleError> {
        let reflector_address: Address = env
            .storage()
            .instance()
            .get(&DataKey::Reflector)
            .ok_or(OracleError::NotInitialized)?;

        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        let client = ReflectorPulseClient::new(&env, &reflector_address);
        let ticker = ReflectorAsset::Other(asset.clone());
        let price_data = client.lastprice(&ticker);

        match price_data {
            Some(data) => {
                let reflector_decimals = client.decimals();
                let normalized = normalize_price(data.price, reflector_decimals, PRICE_DECIMALS);

                log!(
                    &env,
                    "Oracle: raw={}, decimals={}, normalized={}",
                    data.price,
                    reflector_decimals,
                    normalized,
                );

                Ok(normalized)
            }
            None => Err(OracleError::PriceNotAvailable),
        }
    }

    pub fn decimals(_env: Env) -> u32 {
        PRICE_DECIMALS
    }

    pub fn get_reflector_address(env: Env) -> Result<Address, OracleError> {
        env.storage()
            .instance()
            .get(&DataKey::Reflector)
            .ok_or(OracleError::NotInitialized)
    }
}

fn normalize_price(price: i128, from_decimals: u32, to_decimals: u32) -> i128 {
    if from_decimals > to_decimals {
        price / 10i128.pow(from_decimals - to_decimals)
    } else if from_decimals < to_decimals {
        price * 10i128.pow(to_decimals - from_decimals)
    } else {
        price
    }
}

#[cfg(test)]
mod test;
