import {gameState} from './state';

const config = {
  'networkId': 'testnet',
  'keyStore': new window['nearApi']['keyStores']['BrowserLocalStorageKeyStore'](),
  'nodeUrl': 'https://rpc.testnet.near.org',
  'walletUrl': 'https://wallet.testnet.near.org',
  'helperUrl': 'https://helper.testnet.near.org',
  'headers': {}
};

let near;
let wallet;
let contract;
export let isPremiumNear = false;

export async function initNearWallet() {
  near = await window['nearApi']['connect'](config);
  wallet = new window['nearApi']['WalletConnection'](near, null);
  contract = new window['nearApi']['Contract'](
    wallet['account'](), // the account object that is connecting
    'hades-dev.vilpy.testnet',
    {
      // name of contract you're connecting to
      'viewMethods': ['get_state'], // view methods do not change state but usually return a value
      'changeMethods': ['new', 'save_map', 'buy_premium'] // change methods modify state
    }
  );
  isPremiumNear = (await getCurrentNearState())?.['premium_user'] ?? false;
}

export async function loginWithNear() {
  if (!isLoggedInWithNear()) {
    await wallet?.['requestSignIn']('hades-dev.vilpy.testnet', 'Hades Defence');
  }
}

export function logoutNear() {
  wallet?.['signOut']();
  window.location.reload();
}

export function isLoggedInWithNear() {
  return Boolean(wallet?.['isSignedIn']());
}

export async function getCurrentNearState() {
  if (!isLoggedInWithNear()) {
    return undefined;
  }
  return contract['get_state']({'account_id': wallet?.['getAccountId']()});
}

export async function getUsersNearState(userId) {
  if (!isLoggedInWithNear()) {
    return undefined;
  }
  return contract['get_state']({'account_id': userId});
}

export async function initNearGame() {
  let state = await getCurrentNearState();
  if (!state) {
    state = await contract['new']();
  }

  gameState.loadFromNearState(state);
}

export async function saveStateToNear(data) {
  await contract['save_map']({'data': data});
}

export async function buyPremium() {
  await contract['buy_premium']({}, undefined, '500000000000000000000000');
}
