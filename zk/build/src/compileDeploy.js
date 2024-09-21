"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
const FormVerifier_1 = require("./FormVerifier");
const o1js_1 = require("o1js");
// Function to deploy the contract
async function deployContract(deployerPrivateKey, zkAppPrivateKey) {
    const deployerPublicKey = deployerPrivateKey.toPublicKey();
    const zkAppPublicKey = zkAppPrivateKey.toPublicKey();
    console.log("Deployer Public Key:", deployerPublicKey.toBase58());
    console.log("zkApp Public Key:", zkAppPublicKey.toBase58());
    console.log("Compiling smart contract...");
    await FormVerifier_1.FormVerifier.compile();
    console.log("Deploying FormVerifier...");
    const formVerifier = new FormVerifier_1.FormVerifier(zkAppPublicKey);
    const txn = await o1js_1.Mina.transaction(deployerPublicKey, async () => {
        o1js_1.AccountUpdate.fundNewAccount(deployerPublicKey);
        formVerifier.deploy();
    });
    await txn.prove();
    const signedTxn = await txn
        .sign([deployerPrivateKey, zkAppPrivateKey])
        .send();
    console.log("Transaction hash:", signedTxn.hash);
    if (signedTxn.status === "pending") {
        console.log("Contract deployed successfully!");
        // Set initial values
        console.log("Setting initial values...");
        const setValuesTxn = await o1js_1.Mina.transaction(deployerPublicKey, async () => {
            formVerifier.setExpectedServerIDs((0, o1js_1.Field)(12345), (0, o1js_1.Field)(67890));
            formVerifier.setExpectedTlsCertificateFingerprint((0, o1js_1.Field)(123456789));
        });
        await setValuesTxn.prove();
        const signedSetValuesTxn = await setValuesTxn
            .sign([deployerPrivateKey])
            .send();
        console.log("Set values transaction hash:", signedSetValuesTxn.hash);
        if (signedSetValuesTxn.status) {
            console.log("Initial values set successfully!");
        }
        else {
            console.error("Failed to set initial values:", signedSetValuesTxn.status);
        }
    }
    else {
        console.error("Failed to deploy contract:", signedTxn.status);
    }
}
// Main function to run the deployment
async function main() {
    console.log("o1js loaded");
    // Read the deployer's private key from a file
    const deployerPrivateKey = o1js_1.PrivateKey.fromBase58(constants_1.PRIVATE_KEY);
    console.log(">>>>> Deployer Private Key : ", deployerPrivateKey);
    // Generate a new keypair for the zkApp
    const zkAppPrivateKey = o1js_1.PrivateKey.random();
    console.log(">>>>> ZK App Private Key : ", deployerPrivateKey);
    const useLocalBlockchain = false;
    if (useLocalBlockchain) {
        const Local = await o1js_1.Mina.LocalBlockchain({ proofsEnabled: false });
        o1js_1.Mina.setActiveInstance(Local);
    }
    else {
        const network = o1js_1.Mina.Network("https://api.minascan.io/node/devnet/v1/graphql");
        o1js_1.Mina.setActiveInstance(network);
    }
    await deployContract(deployerPrivateKey, zkAppPrivateKey);
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
