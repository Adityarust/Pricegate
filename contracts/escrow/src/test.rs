#![cfg(test)]

use crate::{Condition, EscrowContract, EscrowContractClient, Status};
use soroban_sdk::{
    contract, contractimpl, contracttype,
    testutils::{Address as _, Ledger},
    token, Address, Env, Symbol,
};

// --- Mock Oracle: returns a configurable price ---

#[contracttype]
#[derive(Clone)]
enum MockKey {
    Price,
}

#[contract]
struct MockOracle;

#[contractimpl]
impl MockOracle {
    pub fn set_price(env: Env, price: i128) {
        env.storage().instance().set(&MockKey::Price, &price);
    }

    pub fn get_price(env: Env, _asset: Symbol) -> i128 {
        env.storage().instance().get(&MockKey::Price).unwrap()
    }
}

// --- Helpers ---

struct TestEnv<'a> {
    env: Env,
    escrow: EscrowContractClient<'a>,
    oracle: MockOracleClient<'a>,
    sender: Address,
    recipient: Address,
}

fn setup() -> TestEnv<'static> {
    let env = Env::default();
    env.mock_all_auths();

    // Ledger timestamp
    env.ledger().with_mut(|li| {
        li.timestamp = 1000;
    });

    let token_admin = Address::generate(&env);
    let xlm_address = env.register_stellar_asset_contract_v2(token_admin.clone());
    let xlm_admin = token::StellarAssetClient::new(&env, &xlm_address.address());

    let oracle_id = env.register(MockOracle, ());
    let oracle = MockOracleClient::new(&env, &oracle_id);
    oracle.set_price(&1_200_000i128); // $0.12

    let escrow_id = env.register(EscrowContract, ());
    let escrow = EscrowContractClient::new(&env, &escrow_id);

    let admin = Address::generate(&env);
    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);

    escrow.initialize(&admin, &oracle_id, &xlm_address.address());

    // Mint 1000 XLM to sender
    xlm_admin.mint(&sender, &1000_0000000i128);

    TestEnv {
        env,
        escrow,
        oracle,
        sender,
        recipient,
    }
}

// --- Tests ---

#[test]
fn test_create_gate() {
    let t = setup();

    let gate_id = t.escrow.create_gate(
        &t.sender,
        &t.recipient,
        &100_0000000i128, // 100 XLM
        &Condition::PriceAbove(2_000_000i128), // $0.20 threshold
        &2000u64, // deadline
    );

    assert_eq!(gate_id, 0);

    let gate = t.escrow.get_gate(&gate_id);
    assert_eq!(gate.sender, t.sender);
    assert_eq!(gate.recipient, t.recipient);
    assert_eq!(gate.amount, 100_0000000);
    assert_eq!(gate.condition, Condition::PriceAbove(2_000_000i128));
    assert_eq!(gate.deadline, 2000);
    assert_eq!(gate.status, Status::Locked);
    assert_eq!(t.escrow.get_gate_count(), 1);
}

#[test]
fn test_release_when_price_above() {
    let t = setup();

    let gate_id = t.escrow.create_gate(
        &t.sender,
        &t.recipient,
        &100_0000000i128,
        &Condition::PriceAbove(2_000_000i128), // release when > $0.20
        &2000u64,
    );

    // Set price above threshold: $0.25
    t.oracle.set_price(&2_500_000i128);

    let status = t.escrow.check_and_release(&gate_id);
    assert_eq!(status, Status::Released);

    let gate = t.escrow.get_gate(&gate_id);
    assert_eq!(gate.status, Status::Released);
}

#[test]
fn test_release_when_price_below() {
    let t = setup();

    let gate_id = t.escrow.create_gate(
        &t.sender,
        &t.recipient,
        &100_0000000i128,
        &Condition::PriceBelow(2_000_000i128), // release when < $0.20
        &2000u64,
    );

    // Set price below threshold: $0.15
    t.oracle.set_price(&1_500_000i128);

    let status = t.escrow.check_and_release(&gate_id);
    assert_eq!(status, Status::Released);

    let gate = t.escrow.get_gate(&gate_id);
    assert_eq!(gate.status, Status::Released);
}

#[test]
fn test_refund_on_deadline_passed() {
    let t = setup();

    let gate_id = t.escrow.create_gate(
        &t.sender,
        &t.recipient,
        &100_0000000i128,
        &Condition::PriceAbove(2_000_000i128),
        &2000u64,
    );

    // Advance past deadline
    t.env.ledger().with_mut(|li| {
        li.timestamp = 3000;
    });

    let status = t.escrow.check_and_release(&gate_id);
    assert_eq!(status, Status::Refunded);

    let gate = t.escrow.get_gate(&gate_id);
    assert_eq!(gate.status, Status::Refunded);
}

#[test]
#[should_panic]
fn test_unauthorized_caller_fails() {
    let env = Env::default();
    // No mock_all_auths — auth will fail

    env.ledger().with_mut(|li| {
        li.timestamp = 1000;
    });

    let token_admin = Address::generate(&env);
    let xlm_address = env.register_stellar_asset_contract_v2(token_admin.clone());

    let oracle_id = env.register(MockOracle, ());
    let escrow_id = env.register(EscrowContract, ());
    let escrow = EscrowContractClient::new(&env, &escrow_id);

    escrow.initialize(&Address::generate(&env), &oracle_id, &xlm_address.address());

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);

    // Should panic — sender hasn't authorized
    escrow.create_gate(
        &sender,
        &recipient,
        &100_0000000i128,
        &Condition::PriceAbove(2_000_000i128),
        &2000u64,
    );
}

#[test]
fn test_release_when_price_in_range() {
    let t = setup();

    let gate_id = t.escrow.create_gate(
        &t.sender,
        &t.recipient,
        &100_0000000i128,
        &Condition::PriceRange(1_500_000i128, 2_500_000i128),
        &2000u64,
    );

    // Set price inside the range: $0.20
    t.oracle.set_price(&2_000_000i128);

    let status = t.escrow.check_and_release(&gate_id);
    assert_eq!(status, Status::Released);

    let gate = t.escrow.get_gate(&gate_id);
    assert_eq!(gate.status, Status::Released);
}
