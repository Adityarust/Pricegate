#![no_std]

/// PriceGate Escrow Contract


use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, log, token, Address, Env, Symbol,
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/// TTL bump for instance storage (~30 days at 5s/ledger).
const INSTANCE_BUMP_AMOUNT: u32 = 518_400;

/// TTL threshold to trigger instance bump (~7 days).
const INSTANCE_LIFETIME_THRESHOLD: u32 = 120_960;

/// TTL bump for persistent storage (gate configs) (~60 days).
const PERSISTENT_BUMP_AMOUNT: u32 = 1_036_800;

/// TTL threshold to trigger persistent bump (~14 days).
const PERSISTENT_LIFETIME_THRESHOLD: u32 = 241_920;

// ---------------------------------------------------------------------------
// Storage keys
// ---------------------------------------------------------------------------

#[contracttype]
enum DataKey {
    /// Admin address (set once during initialization)
    Admin,
    /// Address of the deployed PriceGate oracle contract
    OracleAddress,
    /// Address of the native XLM Stellar Asset Contract (SAC)
    XlmToken,
    /// Auto-incrementing gate ID counter
    GateCount,
    /// Individual gate config, keyed by gate ID
    Gate(u64),
}



/// Price condition that must be met to release escrowed funds.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum Condition {
    /// Release when price goes above the threshold
    PriceAbove,
    /// Release when price drops below the threshold
    PriceBelow,
}

/// Current status of an escrow gate.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum Status {
    /// Funds are locked, waiting for condition or deadline
    Locked,
    /// Condition was met — funds released to recipient
    Released,
    /// Deadline passed without condition being met — funds refunded to sender
    Refunded,
}

/// Full configuration and state of an escrow gate.
#[contracttype]
#[derive(Clone, Debug)]
pub struct GateConfig {
    /// Address that created the gate and deposited funds
    pub sender: Address,
    /// Address that receives funds if the price condition is met
    pub recipient: Address,
    /// Amount of XLM locked (in stroops, i.e., 1 XLM = 10_000_000 stroops)
    pub amount: i128,
    /// Price threshold with 7 decimal places (e.g., $0.20 = 2_000_000)
    pub threshold: i128,
    /// Whether to release on price above or below threshold
    pub condition: Condition,
    /// Unix timestamp deadline — if reached without condition met, funds are refunded
    pub deadline: u64,
    /// Current status of this gate
    pub status: Status,
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum EscrowError {
    /// Contract has already been initialized
    AlreadyInitialized = 1,
    /// Contract has not been initialized yet
    NotInitialized = 2,
    /// No gate found with the given ID
    GateNotFound = 3,
    /// Amount must be greater than zero
    InvalidAmount = 4,
    /// Deadline must be in the future
    InvalidDeadline = 5,
    /// Gate is not in Locked status (already released or refunded)
    GateNotLocked = 6,
    /// Caller is not authorized for this operation
    Unauthorized = 7,
}

// ---------------------------------------------------------------------------
// Contract
// ---------------------------------------------------------------------------

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
   ` — address of the deployed PriceGate oracle contract
    
    pub fn initialize(
        env: Env,
        admin: Address,
        oracle_address: Address,
        xlm_token: Address,
    ) -> Result<(), EscrowError> {
        // Prevent double initialization
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(EscrowError::AlreadyInitialized);
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::OracleAddress, &oracle_address);
        env.storage()
            .instance()
            .set(&DataKey::XlmToken, &xlm_token);
        env.storage().instance().set(&DataKey::GateCount, &0u64);

        log!(&env, "PriceGate Escrow initialized");
        Ok(())
    }

  
   
    pub fn create_gate(
        env: Env,
        sender: Address,
        recipient: Address,
        amount: i128,
        threshold: i128,
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

       
        let token_client = token::Client::new(&env, &xlm_token);
        token_client.transfer(&sender, &env.current_contract_address(), &amount);

        
        let gate_id: u64 = env
            .storage()
            .instance()
            .get(&DataKey::GateCount)
            .ok_or(EscrowError::NotInitialized)?;

        // Build the gate config
        let gate = GateConfig {
            sender: sender.clone(),
            recipient: recipient.clone(),
            amount,
            threshold,
            condition,
            deadline,
            status: Status::Locked,
        };

        // Store gate in persistent storage (survives longer than instance)
        env.storage()
            .persistent()
            .set(&DataKey::Gate(gate_id), &gate);

        // Update counter
        env.storage()
            .instance()
            .set(&DataKey::GateCount, &(gate_id + 1));

        // Extend TTLs
        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
        env.storage().persistent().extend_ttl(
            &DataKey::Gate(gate_id),
            PERSISTENT_LIFETIME_THRESHOLD,
            PERSISTENT_BUMP_AMOUNT,
        );

        // Emit GateCreated event
        env.events()
            .publish((Symbol::new(&env, "GateCreated"), gate_id), gate.clone());

        log!(&env, "PriceGate: Gate {} created, amount = {}", gate_id, amount);

        Ok(gate_id)
    }

    
    pub fn get_gate(env: Env, gate_id: u64) -> Result<GateConfig, EscrowError> {
        env.storage()
            .persistent()
            .get(&DataKey::Gate(gate_id))
            .ok_or(EscrowError::GateNotFound)
    }

    /// Returns the total number of gates created.
    pub fn get_gate_count(env: Env) -> Result<u64, EscrowError> {
        env.storage()
            .instance()
            .get(&DataKey::GateCount)
            .ok_or(EscrowError::NotInitialized)
    }

    // check_and_release will be added in Step 4
}

#[cfg(test)]
mod test;
