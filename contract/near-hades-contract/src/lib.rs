use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LookupMap};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{env, near_bindgen, AccountId, BorshStorageKey, Balance};

const PREMIUM_MIN: Balance = 500000000000000000000000;

#[derive(BorshSerialize, BorshStorageKey)]
enum StorageKey {
  Records
}

#[derive(BorshDeserialize, BorshSerialize, Clone, Deserialize, Serialize)]
#[serde(crate = "near_sdk::serde")]
pub struct UserState {
  pub last_saved_map: String,
  pub premium_user: bool
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct NearRawLedger {
  records: LookupMap<AccountId, UserState>,
}

impl Default for NearRawLedger {
  fn default() -> Self {
    Self {
      records: LookupMap::new(StorageKey::Records)
    }
  }
}

#[near_bindgen]
impl NearRawLedger {
  #[payable]
  pub fn new(&mut self) -> UserState {
    let account_id = env::signer_account_id();
    if self.records.get(&account_id).is_some() {
      env::panic_str("Record already created")
    }

    let state = UserState {
      last_saved_map: "".to_string(),
      premium_user: false
    };

    self.records.insert(&account_id, &state);
    state
  }

  #[payable]
  pub fn save_map(&mut self, data: String) -> UserState {
    let account_id = env::signer_account_id();
    let state = self.records.get(&account_id);
    if state.is_none() {
      env::panic_str("Can't save map for uninitialized state");
    }

    let unwrapped_state = state.unwrap();

    let state = UserState {
      premium_user: unwrapped_state.premium_user,
      last_saved_map: data
    };

    self.records.insert(&account_id, &state);

    return state;
  }

  #[payable]
  pub fn buy_premium(&mut self) {
    let account_id = env::signer_account_id();
    let is_premium = env::attached_deposit() >= PREMIUM_MIN;
    let current_state = self.records.get(&account_id);
    if current_state.is_none() {
      let state = UserState {
        last_saved_map: "".to_string(),
        premium_user: is_premium
      };

      self.records.insert(&account_id, &state);
    } else {
      let unwrapped_state = current_state.unwrap();

      let state = UserState {
        premium_user: is_premium,
        last_saved_map: unwrapped_state.last_saved_map
      };

      self.records.insert(&account_id, &state);
    }
  }

  pub fn get_state(&self, account_id: AccountId) -> Option<UserState> {
    let state = self.records.get(&account_id);
    return state;
  }
}
