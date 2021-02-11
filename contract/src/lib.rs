use near_sdk::{
    borsh::{self, BorshDeserialize, BorshSerialize},
    collections::{UnorderedMap, UnorderedSet},
    env,
    json_types::U128,
    near_bindgen, wee_alloc, AccountId,
};
mod account;
mod error;
mod nep21;

use error::Error;

#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

pub type CID = String;
const MAX_CID_LEN: usize = 64;

pub trait FungibleTokenTrait {
    fn inc_allowance(&mut self, art: CID, escrow_account_id: AccountId, amount: U128);
    fn dec_allowance(&mut self, art: CID, escrow_account_id: AccountId, amount: U128);
    fn transfer_from(
        &mut self,
        art: CID,
        owner_id: AccountId,
        new_owner_id: AccountId,
        amount: U128,
    );
    fn transfer(&mut self, art: CID, new_owner_id: AccountId, amount: U128);
    fn get_total_supply(&self, art: CID) -> U128;
    fn get_balance(&self, art: CID, owner_id: AccountId) -> U128;
    fn get_allowance(&self, art: CID, owner_id: AccountId, escrow_account_id: AccountId) -> U128;
}

pub trait TokenFactTrait {
    fn create_token(&mut self, artwork: CID);
}

pub trait DesignTrait {
    fn get_designs(&self, artist: AccountId) -> Vec<CID>;
    fn get_design_tokens(&self, user: AccountId) -> Vec<(CID, U128)>;
}

pub trait Proile {
    fn update_profile(&mut self, profile: CID);
    fn get_profile(&self, artist: CID) -> CID;
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct Token {
    artist: AccountId,
    artwork: CID,
    token: nep21::FungibleToken,
}

#[near_bindgen]
#[derive(BorshSerialize, BorshDeserialize)]
pub struct FurBall {
    total_supply_new_tok: U128,
    artist_to_artist_cid: UnorderedMap<AccountId, CID>,
    art_cid_to_token: UnorderedMap<CID, Token>,
    art_cids: UnorderedSet<CID>,
}

impl Default for FurBall {
    fn default() -> Self {
        panic!("FurBall must be intialized before use!")
    }
}

/// Constructor implementation
#[near_bindgen]
impl FurBall {
    #[init]
    pub fn new() -> Self {
        let owner_id = env::predecessor_account_id();
        let total_supply_new_tok = 1_000_000_000.into();
        assert!(
            env::is_valid_account_id(owner_id.as_bytes()),
            "Owner's account ID is invalid."
        );
        assert!(!env::state_exists(), "Already initialized");
        let fb = Self {
            artist_to_artist_cid: UnorderedMap::new(b"artistCID-belongs-to".to_vec()),
            art_cid_to_token: UnorderedMap::new(b"artCID-of-token".to_vec()),
            art_cids: UnorderedSet::new(b"all-art-cids".to_vec()),
            total_supply_new_tok,
        };
        fb
    }
}

/// Private function implementation
impl FurBall {
    fn get_art(&self, art: &CID) -> Result<Token, Error> {
        // TODO: err msg
        self.art_cid_to_token
            .get(&art)
            .ok_or(Error::ArtCIDNotFound(art.to_string()))
    }
}

#[near_bindgen]
impl Proile for FurBall {
    #[payable]
    fn update_profile(&mut self, profile: CID) {
        self.artist_to_artist_cid
            .insert(&env::predecessor_account_id(), &profile);
    }

    fn get_profile(&self, artist: CID) -> CID {
        self.artist_to_artist_cid.get(&artist).unwrap()
    }
}

#[near_bindgen]
impl DesignTrait for FurBall {
    fn get_designs(&self, artist: AccountId) -> Vec<CID> {
        let mut designs = Vec::new();
        for art_cid in self.art_cids.iter() {
            if let Some(token) = self.art_cid_to_token.get(&art_cid) {
                if token.artist == artist {
                    designs.push(art_cid.clone());
                }
            }
        }
        designs
    }
    fn get_design_tokens(&self, user: AccountId) -> Vec<(CID, U128)> {
        let mut designs = Vec::new();
        for (art_cid, token) in self.art_cid_to_token.iter() {
            if let Some(account) = token.token.accounts.get(&env::sha256(user.as_bytes())) {
                designs.push((art_cid.clone(), account.balance.into()));
            }
        }
        designs
    }
}

#[near_bindgen]
impl TokenFactTrait for FurBall {
    #[payable]
    fn create_token(&mut self, artwork: CID) {
        assert!(
            self.art_cid_to_token.get(&artwork).is_none(),
            format!("Artwork with CID {} cannot already have a token", artwork)
        );
        assert!(
            artwork.len() <= MAX_CID_LEN,
            format!(
                "Artwork CID must be shorter than {} characters",
                MAX_CID_LEN
            )
        );
        let tok = Token {
            artist: env::predecessor_account_id(),
            artwork: artwork.clone(),
            token: nep21::FungibleToken::new(
                env::predecessor_account_id(),
                self.total_supply_new_tok,
                artwork.clone(),
            ),
        };
        self.art_cid_to_token.insert(&artwork, &tok);
        self.art_cids.insert(&artwork);
    }
}

/// Add fungible token functionality for individual tokens
#[near_bindgen]
impl FungibleTokenTrait for FurBall {
    #[payable]
    fn inc_allowance(&mut self, art: CID, escrow_account_id: AccountId, amount: U128) {
        let mut art_token = self.get_art(&art).unwrap();
        art_token.token.inc_allowance(escrow_account_id, amount);
    }
    #[payable]
    fn dec_allowance(&mut self, art: CID, escrow_account_id: AccountId, amount: U128) {
        let mut art_token = self.get_art(&art).unwrap();
        art_token.token.dec_allowance(escrow_account_id, amount);
    }
    #[payable]
    fn transfer_from(
        &mut self,
        art: CID,
        owner_id: AccountId,
        new_owner_id: AccountId,
        amount: U128,
    ) {
        let mut art_token = self.get_art(&art).unwrap();
        art_token
            .token
            .transfer_from(owner_id, new_owner_id, amount);
    }
    #[payable]
    fn transfer(&mut self, art: CID, new_owner_id: AccountId, amount: U128) {
        let mut art_token = self.get_art(&art).unwrap();
        art_token.token.transfer(new_owner_id, amount);
    }
    fn get_total_supply(&self, art: CID) -> U128 {
        let art_token = self.get_art(&art).unwrap();
        art_token.token.get_total_supply()
    }

    fn get_balance(&self, art: CID, owner_id: AccountId) -> U128 {
        let art_token = self.get_art(&art).unwrap();
        art_token.token.get_balance(owner_id)
    }
    fn get_allowance(&self, art: CID, owner_id: AccountId, escrow_account_id: AccountId) -> U128 {
        let art_token = self.get_art(&art).unwrap();
        art_token.token.get_allowance(owner_id, escrow_account_id)
    }
}

#[cfg(not(target_arch = "wasm32"))]
#[cfg(test)]
mod tests {
    use near_sdk::MockedBlockchain;
    use near_sdk::{testing_env, VMContext};

    use super::*;

    fn alice() -> AccountId {
        "alice.near".to_string()
    }
    fn bob() -> AccountId {
        "bob.near".to_string()
    }
    fn carol() -> AccountId {
        "carol.near".to_string()
    }

    fn get_context(predecessor_account_id: AccountId) -> VMContext {
        VMContext {
            current_account_id: alice(),
            signer_account_id: bob(),
            signer_account_pk: vec![0, 1, 2],
            predecessor_account_id,
            input: vec![],
            block_index: 0,
            block_timestamp: 0,
            account_balance: 1_000_000_000_000_000_000_000_000_000u128,
            account_locked_balance: 0,
            storage_usage: 10u64.pow(6),
            attached_deposit: 0,
            prepaid_gas: 10u64.pow(18),
            random_seed: vec![0, 1, 2],
            is_view: false,
            output_data_receivers: vec![],
            epoch_height: 0,
        }
    }

    #[test]
    fn test_update_artist_profile() {
        let context = get_context(carol());
        testing_env!(context);
        let mut contract = FurBall::new();

        contract.update_profile("MY Profile CID".to_string());
        assert_eq!(contract.get_profile(carol()), "MY Profile CID");
    }

    #[test]
    fn test_initialize_2_new_tokens() {
        let context = get_context(carol());
        testing_env!(context);
        let mut contract = FurBall::new();

        let art = "QmPAwR5un1YPJEF6iB7KvErDmAhiXxwL5J5qjA3Z9ceKqv".to_string();
        contract.create_token(art.clone());

        let art2 = "QqPAwR5un1YPJEF6iB7KvErDmAhiXxwL5J5qjA3Z9ceKqv".to_string();

        contract.create_token(art2.clone());
    }

    #[test]
    fn test_get_artist_designs() {
        let context = get_context(carol());
        testing_env!(context);

        let mut contract = FurBall::new();
        let art = "QmPAwR5un1YPJEF6iB7KvErDmAhiXxwL5J5qjA3Z9ceKqv".to_string();
        contract.create_token(art.clone());

        let art2 = "mPAwR5un1YPJEF6iB7KvErDmAhiXxwL5J5qjA3Z9ceKqv".to_string();
        contract.create_token(art2.clone());

        let carol_des = contract.get_designs(carol());
        println!("{:?}", carol_des.to_vec());
        assert!(carol_des.contains(&art.clone()));
        assert!(carol_des.contains(&art2.clone()));
        // assert_eq!(carol_des.);
        assert_eq!(contract.get_designs(bob()).to_vec().len(), 0);
    }

    // TODO: this is not working and I have no clue why
    // #[test]
    // #[should_panic]
    // fn test_initialize_new_furball_twice_fails() {
    //     let context = get_context(carol());
    //     testing_env!(context);
    //     let total_supply = 1_000_000_000_000_000u128;
    //     {
    //         let _contract = FurBall::new(bob(), total_supply.into());
    //     }
    //     FurBall::new(bob(), total_supply.into());
    // }

    #[test]
    #[should_panic]
    fn test_initialize_coin_same_art_fails() {
        let context = get_context(carol());
        testing_env!(context);
        let mut contract = FurBall::new();
        let art = "QmPAwR5un1YPJEF6iB7KvErDmAhiXxwL5J5qjA3Z9ceKqv".to_string();
        let art_clone = art.clone();
        contract.create_token(art);
        contract.create_token(art_clone);
    }

    #[test]
    #[should_panic]
    fn test_initialize_coin_cid_too_long() {
        let context = get_context(carol());
        testing_env!(context);
        let mut contract = FurBall::new();
        let art = "QQmPAwR5un1YPJEF6iB7KvErDmAhiXxwL5J5qjA3Z9ceKqvQmPAwR5un1YPJEF6iB7KvErDmAhiXxwL5J5qjA3Z9ceKqvQmPAwR5un1YPJEF6iB7KvErDmAhiXxwL5J5qjA3Z9ceKqvmPAwR5un1YPJEF6iB7KvErDmAhiXxwL5J5qjA3Z9ceKqv".to_string();
        contract.create_token(art);
    }
}
