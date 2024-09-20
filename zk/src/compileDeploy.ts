import { GRAPH_QL_RPC, PRIVATE_KEY } from "./constants";
import { FormVerifier } from "./FormVerifier";
import { Mina, PrivateKey, AccountUpdate, Field } from "o1js";
import { delay, waitForTransaction } from "./utils";

// Function to deploy the contract
async function deployContract(
  deployerPrivateKey: PrivateKey,
  zkAppPrivateKey: PrivateKey
) {
  const deployerPublicKey = deployerPrivateKey.toPublicKey();
  const zkAppPublicKey = zkAppPrivateKey.toPublicKey();

  console.log(">>>>> Deployer Public Key:", deployerPublicKey.toBase58());
  console.log(">>>>> zkApp Public Key:", zkAppPublicKey.toBase58());

  console.log(">>>>> Compiling smart contract...");
  await FormVerifier.compile();

  console.log("Deploying FormVerifier...");
  const formVerifier = new FormVerifier(zkAppPublicKey);
  const txn = await Mina.transaction(
    {
      sender: deployerPublicKey,
      fee: "20000000000",
    },
    async () => {
      AccountUpdate.fundNewAccount(deployerPublicKey);
      await formVerifier.deploy();
    }
  );

  await txn.prove();
  const signedTxn = await txn
    .sign([deployerPrivateKey, zkAppPrivateKey])
    .send();

  console.log("Transaction hash:", signedTxn.hash);

  if (signedTxn.status === "pending") {
    // await waitForTransaction(signedTxn.hash);
    await delay(360 * 1000);

    console.log("Contract deployed successfully!");
    // Set initial values
    console.log("Setting initial values...");
    const setValuesTxn = await Mina.transaction(
      {
        sender: deployerPublicKey,
        fee: "20000000000",
      },
      async () => {
        await formVerifier.setExpectedServerIDs(Field(12345), Field(67890));
        await formVerifier.setExpectedTlsCertificateFingerprint(
          Field(123456789)
        );
      }
    );

    await setValuesTxn.prove();
    const signedSetValuesTxn = await setValuesTxn
      .sign([deployerPrivateKey])
      .send();

    console.log("Set values transaction hash:", signedSetValuesTxn.hash);

    if (signedSetValuesTxn.status) {
      console.log("Initial values set successfully!");
    } else {
      console.error("Failed to set initial values:", signedSetValuesTxn.status);
    }
  } else {
    console.error("Failed to deploy contract:", signedTxn.status);
  }
}

// Main function to run the deployment
async function main() {
  console.log("o1js loaded");

  // Read the deployer's private key from a file
  const deployerPrivateKey = PrivateKey.fromBase58(PRIVATE_KEY);

  console.log(">>>>> Deployer Private Key : ", deployerPrivateKey.toBase58());

  // Generate a new keypair for the zkApp
  const zkAppPrivateKey = PrivateKey.random();

  console.log(">>>>> ZK App Private Key : ", deployerPrivateKey.toBase58());

  const useLocalBlockchain = false;

  if (useLocalBlockchain) {
    const Local = await Mina.LocalBlockchain({ proofsEnabled: false });
    Mina.setActiveInstance(Local);
  } else {
    const network = Mina.Network(GRAPH_QL_RPC);
    Mina.setActiveInstance(network);
  }

  await deployContract(deployerPrivateKey, zkAppPrivateKey);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
