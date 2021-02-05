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

pub type CID = [u8; 64];

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

#[derive(BorshSerialize, BorshDeserialize)]
pub struct Token {
    artist: account::Account,
    artwork: CID,
    token: nep21::FungibleToken,
}

#[near_bindgen]
#[derive(BorshSerialize, BorshDeserialize)]
pub struct FurBall {
    artistToArtistCID: UnorderedMap<AccountId, CID>,
    artCIDToToken: UnorderedMap<CID, Token>,
    artCIDs: UnorderedSet<CID>,
}

#[near_bindgen]
impl FurBall {
    #[init]
    pub fn new(owner_id: AccountId) -> Self {
        assert!(
            env::is_valid_account_id(owner_id.as_bytes()),
            "Owner's account ID is invalid."
        );
        assert!(!env::state_exists(), "Already initialized");
        Self {
            artistToArtistCID: UnorderedMap::new(b"artistCID-belongs-to".to_vec()),
            artCIDToToken: UnorderedMap::new(b"artCID-of-token".to_vec()),
            artCIDs: UnorderedSet::new(b"all-art-cids".to_vec()),
        }
    }
}

impl FurBall {
    fn get_art(&self, art: &CID) -> Result<Token, Error> {
        // TODO: err msg
        self.artCIDToToken
            .get(&art)
            .ok_or(Error::ArtCIDNotFound(*art))
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
        art_token
            .token
            .get_allowance(owner_id, escrow_account_id)
    }
}
