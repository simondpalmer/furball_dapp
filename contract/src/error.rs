use near_sdk::AccountId;

use crate::CID;

#[derive(Debug)]
pub enum Error {
    ArtCIDNotFound(CID),
    ArtAccountIDNotFound(AccountId)
}
