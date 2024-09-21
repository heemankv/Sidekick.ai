"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const o1js_1 = require("o1js");
const FormVerifier_1 = require("./FormVerifier");
const FormInput_1 = require("./FormInput");
const constants_1 = require("./constants");
async function main() {
    console.log("o1js loaded");
    // Read the deployer's private key from a file
    const deployerPrivateKey = o1js_1.PrivateKey.fromBase58(constants_1.PRIVATE_KEY);
    const deployerPublicKey = deployerPrivateKey.toPublicKey();
    // The public key of the deployed contract (you should have this from the deployment)
    const zkAppPublicKey = o1js_1.PublicKey.fromBase58(constants_1.ZK_APP_PUBLIC_KEY);
    // Choose the network (local or real network)
    const useLocalBlockchain = false; // Set this to false to use a real network
    if (useLocalBlockchain) {
        const Local = await o1js_1.Mina.LocalBlockchain({ proofsEnabled: false });
        o1js_1.Mina.setActiveInstance(Local);
    }
    else {
        // Replace with the actual network endpoint
        const network = o1js_1.Mina.Network("https://proxy.berkeley.minaexplorer.com/graphql");
        o1js_1.Mina.setActiveInstance(network);
    }
    // Initialize the contract
    const formVerifier = new FormVerifier_1.FormVerifier(zkAppPublicKey);
    // Create a sample form input
    const input = new FormInput_1.FormInput({
        llmQuestionsHash: o1js_1.CircuitString.fromString("hash1"),
        userInputsHash: o1js_1.CircuitString.fromString("hash2"),
        llmResponsesHash: o1js_1.CircuitString.fromString("hash3"),
        portalSubmissionsHash: o1js_1.CircuitString.fromString("hash4"),
        llmServerID: (0, o1js_1.Field)(12345),
        govServerID: (0, o1js_1.Field)(67890),
        tlsCertificateFingerprint: (0, o1js_1.Field)(123456789),
        tlsCertificateExpirationDate: (0, o1js_1.Field)(1735689600), // Example: December 31, 2024
        currentTimestamp: (0, o1js_1.Field)(1625097600), // Example: July 1, 2021
    });
    // Create a MerkleMap for the witness
    const map = new o1js_1.MerkleMap();
    const formHash = o1js_1.Poseidon.hash(input.toFields());
    const witness = map.getWitness(formHash);
    console.log("Verifying form...");
    const verifyTxn = await o1js_1.Mina.transaction(deployerPublicKey, async () => {
        formVerifier.verifyForm(input, witness);
    });
    await verifyTxn.prove();
    const signedVerifyTxn = await verifyTxn.sign([deployerPrivateKey]).send();
    console.log("Verify transaction hash:", signedVerifyTxn.hash);
    if (signedVerifyTxn.status === "pending") {
        console.log("Form verification transaction successful!");
        // Wait for the transaction to be included in a block
        await signedVerifyTxn.wait();
        // Now get the verification result
        console.log("Getting verification result...");
        const resultTxn = await o1js_1.Mina.transaction(deployerPublicKey, async () => {
            formVerifier.getVerificationResult(input, witness);
        });
        await resultTxn.prove();
        const signedResultTxn = await resultTxn.sign([deployerPrivateKey]).send();
        console.log("Result transaction hash:", signedResultTxn.hash);
        if (signedResultTxn.status === "pending") {
            console.log("Result retrieval transaction successful!");
            // Wait for the transaction to be included in a block
            await signedResultTxn.wait();
            // Fetch and display events
            const events = await formVerifier.fetchEvents();
            const verificationResults = events.filter((e) => e.type === "verification-result");
            if (verificationResults.length > 0) {
                const lastResult = verificationResults[verificationResults.length - 1];
                console.log("Verification result:", lastResult.event.data);
            }
            else {
                console.log("No verification result events found");
            }
        }
        else {
            console.error("Failed to retrieve verification result:", signedResultTxn.status);
        }
    }
    else {
        console.error("Failed to verify form:", signedVerifyTxn.status);
    }
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
