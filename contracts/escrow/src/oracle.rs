// Oracle contract client interface for cross-contract calls

use soroban_sdk::{contractclient, Env, Symbol};

#[allow(dead_code)]
#[contractclient(name = "OracleContractClient")]
pub trait OracleInterface {
    fn get_price(env: Env, asset: Symbol) -> i128;
}
