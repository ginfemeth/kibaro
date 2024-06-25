const yaml = require('js-yaml');
import {Gateway, Wallet} from "fabric-network";
import fs from 'fs';
import {createWallet} from './helper';

var wallet: Wallet;
// (async () => {
//   wallet = await createWallet("org");
// })()

export module BlockChainModule {
  export class BlockchainClient {
    async connectToNetwork(identityLabel: string, chaincode: string, org: string) {
// A wallet stores a collection of identities for use      
      const gateway = new Gateway();
      wallet = await createWallet(org);
      try {
        console.log('connecting to Fabric network...')
        let connectionProfile = yaml.load(fs.readFileSync('./networkConfig.yaml', 'utf8'));
        let connectionOptions = {
          identity: identityLabel,
          wallet: wallet,
          discovery: {
            asLocalhost: false
          }
        };
        // Connect to gateway using network.yaml file and our certificates in _idwallet directory
        await gateway.connect(connectionProfile, connectionOptions);
        console.log('Connected to Fabric gateway.');
        // Connect to our local fabric
        const network = await gateway.getNetwork('certificates');
        console.log('Connected to mychannel. ');
        // Get the contract we have installed on the peer
        const contract = await network.getContract(chaincode);
        let networkObj = {
          contract: contract,
          network: network
        };

        return networkObj;
      } catch (error) {
        console.log(`Error processing transaction. ${error}`);
        console.log(error.stack);
      } finally {
        console.log('Done connecting to network.');
        // gateway.disconnect();
      }
    }

    async redeem(args: any) {
      console.log('args for redeem: ')
      console.log(args)
      let response = await args.contract.submitTransaction(args.function,
        args.issuer, args.paperNumber, args.redeemingOwner, args.redeemDateTime
      );
      return response;
    }

    async issue(args: any) {
      console.log('args for issue: ')
      console.log(args)
      let response = await args.contract.submitTransaction(args.function,
        args.issuer, args.paperNumber, args.issueDateTime, args.maturityDateTime,
        args.faceValue
      );
      return response;
    }

    async buy(args: any) {
      console.log('args for buy: ')
      console.log(args)

      let response = await args.contract.submitTransaction(args.function,
        args.issuer, args.paperNumber, args.currentOwner, args.newOwner,
        args.price, args.purchaseDateTime
      );
      return response;
    }


    async queryByKey(keyPassed: any) {
      let response = await keyPassed.contract.submitTransaction('query', keyPassed.id);
      console.log('query by key response: ')
      console.log(JSON.parse(response.toString()))
      console.log(response.length)
      if (response.length === 2) {
        response = `${keyPassed.id} does not exist`;
        return response;
      }
      response = JSON.parse(response.toString());
      return response;

    }
  }
}

