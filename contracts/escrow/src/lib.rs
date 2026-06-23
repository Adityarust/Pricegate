#![no_std]

//! PriceGate Escrow — locks XLM and releases when a price condition is met.
//! Uses the oracle contract for live price checks via cross-contract calls.

mod oracle;

use oracle::OracleContractClient;
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, log, token, Address, Env, Symbol,
};

const INSTANCE_BUMP_AMOUNT: u32 = 518_400; // ~30 days
const INSTANCE_LIFETIME_THRESHOLD: u32 = 120_960; // ~7 days
const PERSISTENT_BUMP_AMOUNT: u32 = 1_036_800; // ~60 days
const PERSISTENT_LIFETIME_THRESHOLD: u32 = 241_920; // ~14 days

#[contracttype]
enum DataKey {
    Admin,
    OracleAddress,
    XlmToken,
    GateCount,
    Gate(u64),
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum Condition {
    PriceAbove(i128),
    PriceBelow(i128),
    PriceRange(i128, i128),
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum Status {
    Locked,
    Released,
    Refunded,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct GateConfig {
    pub sender: Address,
    pub recipient: Address,
    pub amount: i128,    // in stroops (1 XLM = 10_000_000)
    pub condition: Condition,
    pub deadline: u64, // unix timestamp
    pub status: Status,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum EscrowError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    GateNotFound = 3,
    InvalidAmount = 4,
    InvalidDeadline = 5,
    GateNotLocked = 6,
    Unauthorized = 7,
}

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    pub fn initialize(
        env: Env,
        admin: Address,
        oracle_address: Address,
        xlm_token: Address,
    ) -> Result<(), EscrowError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(EscrowError::AlreadyInitialized);
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::OracleAddress, &oracle_address);
        env.storage().instance().set(&DataKey::XlmToken, &xlm_token);
        env.storage().instance().set(&DataKey::GateCount, &0u64);

        log!(&env, "PriceGate Escrow initialized");
        Ok(())
    }

    pub fn create_gate(
        env: Env,
        sender: Address,
        recipient: Address,
        amount: i128,
        condition: Condition,
        deadline: u64,
    ) -> Result<u64, EscrowError> {
        sender.require_auth();

        if amount <= 0 {
            return Err(EscrowError::InvalidAmount);
        }
        if deadline <= env.ledger().timestamp() {
            return Err(EscrowError::InvalidDeadline);
        }

        let xlm_token: Address = env
            .storage()
            .instance()
            .get(&DataKey::XlmToken)
            .ok_or(EscrowError::NotInitialized)?;

        // Lock XLM: sender → this contract
        let token_client = token::Client::new(&env, &xlm_token);
        token_client.transfer(&sender, &env.current_contract_address(), &amount);

        let gate_id: u64 = env
            .storage()
            .instance()
            .get(&DataKey::GateCount)
            .ok_or(EscrowError::NotInitialized)?;

        let gate = GateConfig {
            sender: sender.clone(),
            recipient: recipient.clone(),
            amount,
            condition,
            deadline,
            status: Status::Locked,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Gate(gate_id), &gate);
        env.storage()
            .instance()
            .set(&DataKey::GateCount, &(gate_id + 1));

        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
        env.storage().persistent().extend_ttl(
            &DataKey::Gate(gate_id),
            PERSISTENT_LIFETIME_THRESHOLD,
            PERSISTENT_BUMP_AMOUNT,
        );

        env.events()
            .publish((Symbol::new(&env, "GateCreated"), gate_id), gate.clone());

        log!(&env, "Gate {} created, amount = {}", gate_id, amount);
        Ok(gate_id)
    }

    /// Checks the price condition and releases or refunds. Callable by anyone.
    /// - Deadline passed → refund to sender
    /// - Condition met → release to recipient
    /// - Otherwise → stays Locked
    pub fn check_and_release(env: Env, gate_id: u64) -> Result<Status, EscrowError> {
        let mut gate: GateConfig = env
            .storage()
            .persistent()
            .get(&DataKey::Gate(gate_id))
            .ok_or(EscrowError::GateNotFound)?;

        if gate.status != Status::Locked {
            return Err(EscrowError::GateNotLocked);
        }

        let xlm_token: Address = env
            .storage()
            .instance()
            .get(&DataKey::XlmToken)
            .ok_or(EscrowError::NotInitialized)?;

        let token_client = token::Client::new(&env, &xlm_token);
        let now = env.ledger().timestamp();

        // Deadline passed → refund
        if now >= gate.deadline {
            token_client.transfer(&env.current_contract_address(), &gate.sender, &gate.amount);

            gate.status = Status::Refunded;
            env.storage()
                .persistent()
                .set(&DataKey::Gate(gate_id), &gate);

            env.events()
                .publish((Symbol::new(&env, "GateRefunded"), gate_id), gate.clone());

            log!(&env, "Gate {} refunded (deadline passed)", gate_id);
            return Ok(Status::Refunded);
        }

        // Cross-contract call to oracle
        let oracle_address: Address = env
            .storage()
            .instance()
            .get(&DataKey::OracleAddress)
            .ok_or(EscrowError::NotInitialized)?;

        let oracle_client = OracleContractClient::new(&env, &oracle_address);
        let xlm_symbol = Symbol::new(&env, "XLM");
        let current_price = oracle_client.get_price(&xlm_symbol);

        log!(
            &env,
            "Gate {}: price={}",
            gate_id,
            current_price
        );

        // Check condition
        let condition_met = match gate.condition {
            Condition::PriceAbove(threshold) => current_price > threshold,
            Condition::PriceBelow(threshold) => current_price < threshold,
            Condition::PriceRange(min, max) => current_price >= min && current_price <= max,
        };

        if condition_met {
            // Release to recipient
            token_client.transfer(
                &env.current_contract_address(),
                &gate.recipient,
                &gate.amount,
            );

            gate.status = Status::Released;
            env.storage()
                .persistent()
                .set(&DataKey::Gate(gate_id), &gate);

            env.events()
                .publish((Symbol::new(&env, "GateReleased"), gate_id), gate.clone());

            log!(&env, "Gate {} released to recipient", gate_id);
            Ok(Status::Released)
        } else {
            // Condition not met, keep locked
            env.storage().persistent().extend_ttl(
                &DataKey::Gate(gate_id),
                PERSISTENT_LIFETIME_THRESHOLD,
                PERSISTENT_BUMP_AMOUNT,
            );

            log!(&env, "Gate {} still locked", gate_id);
            Ok(Status::Locked)
        }
    }

    pub fn get_gate(env: Env, gate_id: u64) -> Result<GateConfig, EscrowError> {
        env.storage()
            .persistent()
            .get(&DataKey::Gate(gate_id))
            .ok_or(EscrowError::GateNotFound)
    }

    pub fn get_gate_count(env: Env) -> Result<u64, EscrowError> {
        env.storage()
            .instance()
            .get(&DataKey::GateCount)
            .ok_or(EscrowError::NotInitialized)
    }
}

#[cfg(test)]
mod test;
