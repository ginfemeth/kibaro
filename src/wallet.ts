import { Wallet, Wallets } from "fabric-network";
// import * as fs from 'fs'

const buildWallet = async (walletPath: string): Promise<Wallet> => {
  // Create a new  wallet : Note that wallet is for managing identities.
  let wallet: Wallet;
  if (walletPath) {
    // remove any pre-existing wallet from prior runs
    // fs.rmSync(walletPath, { recursive: true, force: true });

    wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Built a file system wallet at ${walletPath}`);
  } else {
    wallet = await Wallets.newInMemoryWallet();
    console.log("Built an in memory wallet");
  }

  return wallet;
};

export {
  buildWallet
}