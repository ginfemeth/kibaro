import FabricCAServices from "fabric-ca-client";
import fs from "fs";
import log4js from "log4js";
import path from "path";
import config from "./general-config.json";
import {buildWallet} from "./wallet";
const yaml = require('js-yaml');


// Setting default environment type if not mentioned to local
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "local";
}

const logger = log4js.getLogger("fabric-helper");
logger.level = config.loglevel;

const ledgerOpsStatus = {
  success: "SUCCESS",
  error: "ERROR",
};

const enrollAdmin = async (orgName: string): Promise<{success: boolean}> => {
  try {
    // const ccp = getCCP(orgName);
    let ccp = yaml.load(fs.readFileSync('./networkConfig.yaml', 'utf8'));

    const clientOrg = orgName;

    const org = ccp.organizations[clientOrg];
    const caClient = await getCAClientByOrg(orgName);

    // Create a new file system based wallet for managing identities.
    const wallet = await createWallet(orgName);
    const {adminUserId, adminUserPasswd} = await getAdminCreds(orgName);

    // Check to see if we've already enrolled the admin user.
    const identity = await wallet.get(adminUserId);
    if (identity) {
      console.log(
        "An identity for the admin user already exists in the wallet"
      );
      return {success: false};
    }

    // Enroll the admin user, and import the new identity into the wallet.
    const enrollment = await caClient.enroll({
      enrollmentID: adminUserId,
      enrollmentSecret: adminUserPasswd,
    });
    const x509Identity = await createIdentity(enrollment, org);
    await wallet.put(adminUserId, x509Identity);
    logger.info(
      "Successfully enrolled admin user and imported it into the wallet"
    );
    return {success: true};
  } catch (error: any) {
    console.error(`Failed to enroll admin user1 : ${error}`);
    throw new Error("Failed to enroll admin user2: " + error.toString());
  }
};

const registerAndEnrollUser = async (
  username: string,
  secret: string,
  userOrg: string
): Promise<{success: boolean; message: string}> => {
  try {
    let ccp = yaml.load(fs.readFileSync('./networkConfig.yaml', 'utf8'));

    const clientOrg = "kibarocertMSP";//kibarocertMSP
    // const clientOrg = ccp.client.organization;
    const org = ccp.organizations[clientOrg];
    const {adminUserId} = await getAdminCreds(userOrg);

    const caClient = await getCAClientByOrg(userOrg);
    // Check to see if we've already enrolled the user
    const wallet = await createWallet(userOrg);

    const userIdentity = await wallet.get(username);

    if (userIdentity) {
      logger.info(
        `An identity for the user ${username} already exists in the wallet`
      );

      return {
        success: false,
        message: `An identity for the user ${username} already exists in the wallet`,
      };
    }

    // Must use an admin to register a new user
    const adminIdentity = await wallet.get(adminUserId);
    if (!adminIdentity) {
      logger.info(
        "An identity for the admin user does not exist in the wallet"
      );
      throw new Error(
        "An identity for the admin user does not exist in the wallet, enroll the admin user before retrying"
      );
    }

    // Build a user object for authenticating with the CA
    const provider = wallet
      .getProviderRegistry()
      .getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, adminUserId);

    // Register the user, enroll the user, and import the new identity into the wallet.
    // If affiliation is specified by the client, the affiliation value must be configured in CA
    const affiliation = userOrg.toLowerCase() + ".department1";

    await caClient.register(
      {
        enrollmentID: username,
        enrollmentSecret: secret,
        role: "client",
        affiliation: "",
      },
      adminUser
    );

    const enrollment = await caClient.enroll({
      enrollmentID: username,
      enrollmentSecret: secret,
    });
    const x509Identity = await createIdentity(enrollment, org);

    await wallet.put(username, x509Identity);
    logger.info(
      `Successfully registered and enrolled user ${username} and imported it into the wallet`
    );
    const response = {
      success: true,
      message: username,
    };
    return response;
  } catch (err: any) {
    console.log(err);
    if (err.toString().includes("Calling register endpoint failed")) {
      return {
        success: false,
        message: "Fabric CA is busy/unreachable. Try again later",
      };
    }
    logger.error(`Failed to register user : ${err}`);
    throw err;
  }
};

const getRegisteredUser = async (username: string, userOrg: string) => {
  try {
    const wallet = await createWallet(userOrg);
    const userIdentity = await wallet.get(username);
    if (!userIdentity) {
      logger.error(
        `An identity for the user ${username} does not exists in the wallet`
      );
      throw "User does not exist";
    }

    // build a user object
    let provider = wallet.getProviderRegistry().getProvider(userIdentity.type);
    const user = await provider.getUserContext(userIdentity, username);

    if (user && user.isEnrolled()) {
      logger.info(
        'Successfully loaded "%s" of org "%s" from persistence',
        username,
        userOrg
      );
      return user;
    } else {
      throw "username or password incorrect";
    }
  } catch (err: any) {
    throw new Error(err);
  }
};

//create new folder for storing the identities
const createWallet = async (orgName: string) => {
  let walletPath = path.join(
    __dirname,
    `../local_fabric/wallet/` + orgName
  );
  const wallet = await buildWallet(walletPath);
  return wallet;
};
const getCCP2 = (chemin: string) => {
  // load the common connection configuration file
  const ccpPath = path.resolve(
    __dirname, chemin
  );
  const fileExists = fs.existsSync(ccpPath);
  if (!fileExists) {
    throw new Error(`no such file or directory: ${ccpPath}`);
  }
  const contents = fs.readFileSync(ccpPath, "utf8");

  // build a JSON object from the file contents
  const ccp = JSON.parse(contents);

  logger.debug(`Loaded the network configuration located at ${ccpPath}`);
  return ccp;
};

const createIdentity = async (enrollment: any, orgName: any) => {
  let x509Identity;
  x509Identity = {
    credentials: {
      certificate: enrollment.certificate,
      privateKey: enrollment.key.toBytes(),
    },
    mspId: orgName.mspid,
    type: "X.509",
  };
  return x509Identity;
};

const getCCP = (org: string) => {
  // load the common connection configuration file
  const ccpPath = path.resolve(
    __dirname, "../../fabric-connection.json"
  );
  const fileExists = fs.existsSync(ccpPath);
  if (!fileExists) {
    throw new Error(`no such file or directory: ${ccpPath}`);
  }
  const contents = fs.readFileSync(ccpPath, "utf8");

  // build a JSON object from the file contents
  const ccp = JSON.parse(contents);

  logger.debug(`Loaded the network configuration located at ${ccpPath}`);
  return ccp;
};
// const (
// 	mspID        = "Org1MSP"
// 	cryptoPath   = "../../test-network/organizations/peerOrganizations/org1.example.com"
// 	certPath     = cryptoPath + "/users/User1@org1.example.com/msp/signcerts"
// 	keyPath      = cryptoPath + "/users/User1@org1.example.com/msp/keystore"
// 	tlsCertPath  = cryptoPath + "/peers/peer0.org1.example.com/tls/ca.crt"
// 	peerEndpoint = "dns:///localhost:7051"
// 	gatewayPeer  = "peer0.org1.example.com"
// )
const getCAClientByOrg = async (orgName: string) => {
  // const ccp = getCCP(orgName);
  let ccp = yaml.load(fs.readFileSync('./networkConfig.yaml', 'utf8'));

  const clientOrg = orgName;
  logger.debug("Client Org -> ", clientOrg);
  const org = ccp.organizations[clientOrg];
  logger.debug("Org -> ", org);
  const orgCAKey = ccp.certificateAuthorities['kibarocert-ca.kibarocert'];
  logger.debug("Org CA Key -> ", orgCAKey);
  const caURL = orgCAKey.url;
  logger.debug("Org CA URL -> ", caURL);
  const caName = orgCAKey.caName;
  logger.debug("Org CA Name -> ", caName);
  const caTLSCACerts = orgCAKey.tlsCACerts.pem;
  const mspId = org.mspid;
  logger.debug("MSP Id -> ", mspId);

  // enroll user with certificate authority for orgName
  const tlsOptions = {
    trustedRoots: caTLSCACerts,
    verify: false,
  };
  const caClient = new FabricCAServices(caURL, tlsOptions, caName);
  return caClient;
};

const getAdminCreds = async (orgName: string) => {
  let admin = config.adminList.filter((admin) => admin.org == orgName)[0];
  let adminUserId = admin.username;
  let adminUserPasswd = admin.password;
  return {adminUserId, adminUserPasswd};
};

const getOrgCryptoPath = (orgName: string) => {
  // return path.join(
  //   __dirname,`"../../config/fabric-connection.json"`
  //   // __dirname,
  //   // `../../../network/${process.env.NODE_ENV}/organizations/peerOrganizations/${orgName}`
  // );
  const ccp = getCCP(orgName);
  const clientOrg = ccp.client.organization;//kibarocertMSP
  const org = ccp.organizations[clientOrg];
  const user = org.users.admin;
  return user;
};

function prettyJSONString(inputString: string) {
  return JSON.stringify(JSON.parse(inputString), null, 2);
}
// if (`${result}` !== '') {
//   console.log(`*** Result: ${prettyJSONString(result.toString())}`);
// }

export {createIdentity, createWallet, enrollAdmin, getAdminCreds, getCAClientByOrg, getCCP, getCCP2, getOrgCryptoPath, getRegisteredUser, ledgerOpsStatus, registerAndEnrollUser, prettyJSONString};

