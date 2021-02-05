use near_sdk::{
    borsh::{self, BorshDeserialize, BorshSerialize},
    collections::{UnorderedMap, UnorderedSet},
    env,
    json_types::U128,
    near_bindgen, AccountId,
};

mod account;
mod nep21;

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
    fn get_total_supply(&self, art: CID);
    fn get_balance(&self, art: CID, owner_id: AccountId);
    fn get_allowance(&self, art: CID, owner_id: AccountId, escrow_account_id: AccountId) -> U128;
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct Token {
    artist: account::Account,
    artwork: CID,
    token_info: nep21::FungibleToken,
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

/// Add fungible token functionality for individual tokens
#[near_bindgen]
impl FungibleTokenTrait for FurBall {
    fn inc_allowance(&mut self, art: CID, escrow_account_id: AccountId, amount: U128) {
        // TODO: err msg
        let artToken = self.artCIDToToken.get(&art).unwrap();
        artToken.token_info.inc_allowance(escrow_account_id, amount);
    }
}
