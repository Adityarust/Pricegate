#![cfg(test)]

use crate::reflector::{Asset, PriceData};
use crate::{OracleContract, OracleContractClient};
use soroban_sdk::{
    contract, contractimpl, contracttype, testutils::Address as _, Address, Env, Symbol,
};

// Mock Reflector with configurable price + decimals
#[contracttype]
#[derive(Clone)]
enum MockKey {
    Price,
    Decimals,
}

#[contract]
struct MockReflector;

#[contractimpl]
impl MockReflector {
    pub fn set_price(env: Env, price: i128, decimals: u32) {
        env.storage().instance().set(&MockKey::Price, &price);
        env.storage().instance().set(&MockKey::Decimals, &decimals);
    }

    pub fn lastprice(env: Env, _asset: Asset) -> Option<PriceData> {
        let price: i128 = env.storage().instance().get(&MockKey::Price).unwrap_or(0);
        Some(PriceData {
            price,
            timestamp: 1000,
        })
    }

    pub fn decimals(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&MockKey::Decimals)
            .unwrap_or(14)
    }

    pub fn base(env: Env) -> Asset {
        Asset::Other(Symbol::new(&env, "USD"))
    }

    pub fn last_timestamp(_env: Env) -> u64 {
        1000
    }
}

#[test]
fn test_get_price_returns_value() {
    let env = Env::default();
    env.mock_all_auths();

    // Register mock Reflector and set $0.12 with 14 decimals
    let mock_id = env.register(MockReflector, ());
    let mock_client = MockReflectorClient::new(&env, &mock_id);
    mock_client.set_price(&12_000_000_000_000i128, &14u32);

    // Register and init oracle
    let oracle_id = env.register(OracleContract, ());
    let oracle = OracleContractClient::new(&env, &oracle_id);
    oracle.initialize(&Address::generate(&env), &mock_id);

    let price = oracle.get_price(&Symbol::new(&env, "XLM"));

    // 12_000_000_000_000 / 10^(14-7) = 1_200_000 → $0.12 with 7 decimals
    assert_eq!(price, 1_200_000);
}

#[test]
fn test_decimals_returns_seven() {
    let env = Env::default();
    let oracle_id = env.register(OracleContract, ());
    let oracle = OracleContractClient::new(&env, &oracle_id);
    assert_eq!(oracle.decimals(), 7);
}
