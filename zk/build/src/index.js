"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FormVerifier_1 = require("./FormVerifier");
const FormInput_1 = require("./FormInput");
const o1js_1 = require("o1js");
async function main() {
    console.log("o1js loaded");
    const Local = await o1js_1.Mina.LocalBlockchain({ proofsEnabled: false });
    o1js_1.Mina.setActiveInstance(Local);
    const deployerAccount = Local.testAccounts[0];
    const deployerKey = deployerAccount.key;
    const zkAppPrivateKey = o1js_1.PrivateKey.random();
    const zkAppAddress = zkAppPrivateKey.toPublicKey();
    console.log("Deploying FormVerifier...");
    const formVerifier = new FormVerifier_1.FormVerifier(zkAppAddress);
    await deployContract(deployerAccount, deployerKey, zkAppPrivateKey, formVerifier);
    console.log("Setting expected values...");
    await setExpectedValues(deployerAccount, deployerKey, formVerifier);
    // Create a MerkleMap to manage our off-chain state
    let map = new o1js_1.MerkleMap();
    const input_1 = createFormInput("0xabcd", "0xabcd", "0xabcd", "0xabcd");
    const input_2 = createFormInput("0xdead", "0xdead", "0xdead", "0xdead");
    console.log("Processing Form 1");
    map = await processForm(map, deployerAccount, formVerifier, deployerKey, input_1);
    console.log("Processing Form 2");
    map = await processForm(map, deployerAccount, formVerifier, deployerKey, input_2);
}
async function deployContract(deployerAccount, deployerKey, zkAppPrivateKey, formVerifier) {
    const deployTxn = await o1js_1.Mina.transaction(deployerAccount, async () => {
        o1js_1.AccountUpdate.fundNewAccount(deployerAccount);
        formVerifier.deploy();
    });
    await deployTxn.prove();
    await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();
    console.log("Contract deployed");
}
async function setExpectedValues(deployerAccount, deployerKey, formVerifier) {
    const setExpectedValuesTxn = await o1js_1.Mina.transaction(deployerAccount, async () => {
        await formVerifier.setExpectedServerIDs((0, o1js_1.Field)(12345), (0, o1js_1.Field)(67890));
        await formVerifier.setExpectedTlsCertificateFingerprint((0, o1js_1.Field)(123456789));
    });
    await setExpectedValuesTxn.prove();
    await setExpectedValuesTxn.sign([deployerKey]).send();
    console.log("Expected values set");
}
function createFormInput(llmQuestionsHash, userInputsHash, llmResponsesHash, portalSubmissionsHash) {
    return new FormInput_1.FormInput({
        llmQuestionsHash: o1js_1.CircuitString.fromString(llmQuestionsHash),
        userInputsHash: o1js_1.CircuitString.fromString(userInputsHash),
        llmResponsesHash: o1js_1.CircuitString.fromString(llmResponsesHash),
        portalSubmissionsHash: o1js_1.CircuitString.fromString(portalSubmissionsHash),
        llmServerID: (0, o1js_1.Field)(12345),
        govServerID: (0, o1js_1.Field)(67890),
        tlsCertificateFingerprint: (0, o1js_1.Field)(123456789),
        tlsCertificateExpirationDate: (0, o1js_1.Field)(1735689600),
        currentTimestamp: (0, o1js_1.Field)(1625097600),
    });
}
async function processForm(map, deployerAccount, formVerifier, deployerKey, input) {
    const formHash = o1js_1.Poseidon.hash(input.toFields());
    let witness = map.getWitness(formHash);
    console.log("Verifying form...");
    await executeTransaction(deployerAccount, deployerKey, async () => {
        formVerifier.verifyForm(input, witness);
    });
    // Update our off-chain map
    map.set(formHash, (0, o1js_1.Field)(1));
    witness = map.getWitness(formHash);
    console.log("Getting verification result...");
    await executeTransaction(deployerAccount, deployerKey, async () => {
        formVerifier.getVerificationResult(input, witness);
    });
    await logEvents(formVerifier);
    return map;
}
async function executeTransaction(deployerAccount, deployerKey, transactionFunction) {
    const transaction = await o1js_1.Mina.transaction(deployerAccount, transactionFunction);
    await transaction.prove();
    await transaction.sign([deployerKey]).send();
}
async function logEvents(formVerifier) {
    const events = await formVerifier.fetchEvents();
    console.log("Events fetched:");
    events.forEach((e, index) => {
        console.log(`Event ${index + 1}:`, e.event.data);
    });
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
