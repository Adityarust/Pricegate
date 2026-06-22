/// Reflector Protocol Pulse Oracle Interface (SEP-40 compatible)
///
/// This file defines the external contract interface for the Reflector Protocol's
/// Pulse oracle. Only the functions we actually call are included to minimize
/// contract size.
///
/// Reference: https://github.com/reflector-network/reflector-contract
/// Testnet address: CAVLP5DH2GJPZMVO7IJY4CVOD5MWEFTJFVPD2YY2FQXOQHRGHK4D6HLP
use soroban_sdk::{contractclient, contracttype, Address, Env, Symbol};

// ---------------------------------------------------------------------------
// Reflector Pulse client interface
// ---------------------------------------------------------------------------

#[contractclient(name = "ReflectorPulseClient")]
pub trait ReflectorPulse {
    /// Returns the most recent price record for the given asset.
    fn lastprice(env: Env, asset: Asset) -> Option<PriceData>;

    /// Returns the number of decimal places used to represent prices.
    /// This value never changes for a given oracle deployment.
    fn decimals(env: Env) -> u32;

    /// Returns the base asset that all prices are denominated in (typically USD).
    fn base(env: Env) -> Asset;

    /// Returns the timestamp of the most recent price update.
    fn last_timestamp(env: Env) -> u64;
}

// ---------------------------------------------------------------------------
// Reflector types (external — not exported in our contract spec)
// ---------------------------------------------------------------------------

/// Asset identifier used by Reflector oracles.
/// - `Stellar(Address)` — for Stellar Classic and Soroban token contracts
/// - `Other(Symbol)` — for external currencies/tokens (e.g., "BTC", "ETH", "XLM")
#[contracttype(export = false)]
#[derive(Debug, Clone, Eq, PartialEq, Ord, PartialOrd)]
pub enum Asset {
    Stellar(Address),
    Other(Symbol),
}

/// Price record returned by Reflector oracle.
/// `price` is an i128 encoded with `decimals()` fractional digits.
/// Actual price = price / 10^decimals
#[contracttype(export = false)]
#[derive(Debug, Clone, Eq, PartialEq, Ord, PartialOrd)]
pub struct PriceData {
    pub price: i128,
    pub timestamp: u64,
}
