use near_sdk::{env, Balance, Promise, StorageUsage};

use crate::config;
// use quote::{quote};

/// Price per 1 byte of storage from mainnet genesis config.
pub const STORAGE_PRICE_PER_BYTE: Balance = if config::default.refund_storage {100000000000000000000} else {0};


pub fn refund_storage(initial_storage: StorageUsage) {
    if !config::default.refund_storage {
        return;
    }
    let current_storage = env::storage_usage();
    let attached_deposit = env::attached_deposit();
    let refund_amount = if current_storage > initial_storage {
        let required_deposit =
            Balance::from(current_storage - initial_storage) * STORAGE_PRICE_PER_BYTE;
        assert!(
            required_deposit <= attached_deposit,
            "The required attached deposit is {}, but the given attached deposit is is {}",
            required_deposit,
            attached_deposit,
        );
        attached_deposit - required_deposit
    } else {
        attached_deposit + Balance::from(initial_storage - current_storage) * STORAGE_PRICE_PER_BYTE
    };
    if refund_amount > 0 {
        env::log(format!("Refunding {} tokens for storage", refund_amount).as_bytes());
        Promise::new(env::predecessor_account_id()).transfer(refund_amount);
    }
}
