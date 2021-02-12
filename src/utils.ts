import { connect, Contract, keyStores, WalletConnection } from "near-api-js";
import getConfig from "./config/config";

const nearConfig = getConfig(process.env.NODE_ENV || "development");

// Initialize contract & set global variables
export async function initContract() {
  // Initialize connection to the NEAR testnet
  const near = await connect(
    Object.assign(
      { deps: { keyStore: new keyStores.BrowserLocalStorageKeyStore() } },
      nearConfig
    )
  );

  // Initializing Wallet based Account. It can work with NEAR testnet wallet that
  // is hosted at https://wallet.testnet.near.org
  window.walletConnection = new WalletConnection(near, null);

  // Getting the Account ID. If still unauthorized, it's just empty string
  window.accountId = window.walletConnection.getAccountId();

  // Initializing our contract APIs by contract name and configuration
  window.contract = await new Contract(
    window.walletConnection.account(),
    nearConfig.contractName,
    {
      // View methods are read only. They don't modify the state, but usually return some value.
      viewMethods: [
        "get_total_supply",
        "get_allowance",
        "get_balance",
        "get_designs",
        "get_profile",
        "get_design_tokens",
        "get_artwork_cid_of_original_cid",
        "get_amount_on_sale",
        "cost_per_token",
        "get_all_sellers"
      ],
      // Change methods can modify the state. But you don't receive the returned value when called.
      changeMethods: [
        "transfer",
        "transfer_from",
        "dec_allowance",
        "inc_allowance",
        "create_token",
        "update_profile",
        "buy",
      ],
    }
  );
}

export function logout() {
  window.walletConnection.signOut();
  // reload page
  window.location.replace(window.location.origin + window.location.pathname);
}

export function login() {
  // Allow the current app to make calls to the specified contract on the
  // user's behalf.
  // This works by creating a new access key for the user's account and storing
  // the private key in localStorage.
  window.walletConnection.requestSignIn(nearConfig.contractName, "Fur Ball");
}
