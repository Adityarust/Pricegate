// Reflector Pulse oracle interface (SEP-40)
// Ref: https://github.com/reflector-network/reflector-contract

use soroban_sdk::{contractclient, contracttype, Address, Env, Symbol};

#[allow(dead_code)]
#[contractclient(name = "ReflectorPulseClient")]
pub trait ReflectorPulse {
    fn lastprice(env: Env, asset: Asset) -> Option<PriceData>;
    fn decimals(env: Env) -> u32;
    fn base(env: Env) -> Asset;
    fn last_timestamp(env: Env) -> u64;
}

#[contracttype(export = false)]
#[derive(Debug, Clone, Eq, PartialEq, Ord, PartialOrd)]
pub enum Asset {
    Stellar(Address),
    Other(Symbol),
}

#[contracttype(export = false)]
#[derive(Debug, Clone, Eq, PartialEq, Ord, PartialOrd)]
pub struct PriceData {
    pub price: i128,
    pub timestamp: u64,
}
