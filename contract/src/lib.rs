use near_sdk::{near_bindgen, env };
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{ LookupMap, UnorderedMap, TreeMap };
use near_sdk::json_types::U128;

#[global_allocator]
static ALLOC: near_sdk::wee_alloc::WeeAlloc = near_sdk::wee_alloc::WeeAlloc::INIT;

// This isn't required, but a nice way to essentially alias a type
pub type UPC = u128;
pub type AccountIdHash = Vec<u8>;

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct DesignToken {
    design_hash: TreeMap<UPC, String>
}

impl Default for DesignToken {
    fn default() -> Self {
        env::panic(b"The contract is not initialized.")
    }
}

#[near_bindgen]
impl DesignToken {
    /// Init attribute used for instantiation.
    #[init]
    pub fn new() -> Self {
        // Useful snippet to copy/paste, making sure state isn't already initialized
        assert!(env::state_read::<Self>().is_none(), "Already initialized");
        // Note this is an implicit "return" here
        Self {
            design_hash: TreeMap::new(b"d".to_vec()),
        }
    }

    // This functions changes state, so 1st param uses `&mut self`
    /// Add a design hash
    pub fn add_design(&mut self, upc: U128, design: String) {
        let existing_design: Option<String> = self.design_hash.get(&upc.into());
        if existing_design.is_some() {
            env::panic(b"Sorry, already added this design.")
        }
        self.design_hash.insert(&upc.into(), &design);
    }

    // This functions simple returns state, so 1st param uses `&self`
    /// Return the stored ipfs hash for a design
    pub fn get_design(&self, upc: U128, account_id: String) -> String {
        match self.design_hash.get(&upc.into()) {
            Some(stored_design) => {
                let log_message = format!("This design hash is {}", stored_design.clone());
                env::log(log_message.as_bytes());
                // found account user in map, return the hash
                stored_design
            },
            // did not find the design
            // note: curly brackets after arrow are optional in simple cases, like other languages
            None => "No design found.".to_string()
        }
    }

    /// Throw out all designs. (reset the data structure)
    pub fn delete_all(&mut self) {
        assert_eq!(env::current_account_id(), env::predecessor_account_id(), "To delete all designs, this method must be called by the (implied) contract owner.");
        self.design_hash.clear();
        env::log(b"All designs removed, time to sketch!");
    }
}

/*
 * the rest of this file sets up unit tests
 * to run these, the command will be:
 * cargo test -- --nocapture
 */

// use the attribute below for unit tests
#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::MockedBlockchain;
    use near_sdk::{testing_env, VMContext, AccountId};

    // part of writing unit tests is setting up a mock context
    // this is also a useful list to peek at when wondering what's available in env::*
    fn get_context(input: Vec<u8>, is_view: bool, predecessor: AccountId) -> VMContext {
        VMContext {
            current_account_id: "alice.testnet".to_string(),
            signer_account_id: "mike.testnet".to_string(),
            signer_account_pk: vec![0, 1, 2],
            predecessor_account_id: predecessor,
            input,
            block_index: 0,
            block_timestamp: 0,
            account_balance: 0,
            account_locked_balance: 0,
            storage_usage: 0,
            attached_deposit: 0,
            prepaid_gas: 10u64.pow(18),
            random_seed: vec![0, 1, 2],
            is_view,
            output_data_receivers: vec![],
            epoch_height: 19,
        }
    }

    // mark individual unit tests with #[test] for them to be registered and fired
    // unlike other frameworks, the function names don't need to be special or have "test" in it
    #[test]
    fn add_design_hash() {
        // set up the mock context into the testing environment
        let context = get_context(vec![], false, "robert.testnet".to_string());
        testing_env!(context);
        // instantiate a contract variable with the counter at zero
        let mut contract = DesignToken::new();
        let design_upc = U128(679508051007679508);
        let ipfshash = "QmU5eQ66pWzCAKGCWwRdM33nXK99aX9k9rYRGGhmAw552n".to_string();
        contract.add_design(design_upc.clone(), ipfshash.clone());
        // we can do println! in tests, but reminder to use env::log outside of tests
        let returned_ipfs = contract.get_design(design_upc);
        println!("ipfs hash returned: {}", returned_ipfs.clone());
        // confirm
        assert_eq!(ipfshash, returned_ipfs);
    }

}