import { FormVerifier } from "./FormVerifier";
import { FormInput } from "./FormInput";
import {
  Mina,
  PrivateKey,
  PublicKey,
  AccountUpdate,
  Field,
  CircuitString,
  MerkleMap,
  Poseidon,
  MerkleMapWitness,
} from "o1js";
import axios from "axios";

async function main() {
  console.log("o1js loaded");

  const Local = await Mina.LocalBlockchain({ proofsEnabled: false });
  Mina.setActiveInstance(Local);

  const deployerAccount = Local.testAccounts[0];
  const deployerKey = deployerAccount.key;

  const zkAppPrivateKey = PrivateKey.random();
  const zkAppAddress = zkAppPrivateKey.toPublicKey();

  console.log("Deploying FormVerifier...");
  const formVerifier = new FormVerifier(zkAppAddress);
  await deployContract(
    deployerAccount,
    deployerKey,
    zkAppPrivateKey,
    formVerifier
  );

  console.log("Setting expected values...");
  await setExpectedValues(deployerAccount, deployerKey, formVerifier);

  // Create a MerkleMap to manage our off-chain state
  let map = new MerkleMap();

  const input_1 = createFormInput("0xabcd", "0xabcd", "0xabcd", "0xabcd");
  const input_2 = createFormInput("0xdead", "0xdead", "0xdead", "0xdead");

  console.log("Processing Form 1");
  map = await processForm(
    map,
    deployerAccount,
    formVerifier,
    deployerKey,
    input_1
  );

  console.log("Processing Form 2");
  map = await processForm(
    map,
    deployerAccount,
    formVerifier,
    deployerKey,
    input_2
  );
}

async function deployContract(
  deployerAccount: PublicKey,
  deployerKey: PrivateKey,
  zkAppPrivateKey: PrivateKey,
  formVerifier: FormVerifier
) {
  const deployTxn = await Mina.transaction(deployerAccount, async () => {
    AccountUpdate.fundNewAccount(deployerAccount);
    formVerifier.deploy();
  });
  await deployTxn.prove();
  await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();
  console.log("Contract deployed");
}

async function setExpectedValues(
  deployerAccount: PublicKey,
  deployerKey: PrivateKey,
  formVerifier: FormVerifier
) {
  const setExpectedValuesTxn = await Mina.transaction(
    deployerAccount,
    async () => {
      await formVerifier.setExpectedServerIDs(Field(12345), Field(67890));
      await formVerifier.setExpectedTlsCertificateFingerprint(Field(123456789));
    }
  );
  await setExpectedValuesTxn.prove();
  await setExpectedValuesTxn.sign([deployerKey]).send();
  console.log("Expected values set");
}

function createFormInput(
  llmQuestionsHash: string,
  userInputsHash: string,
  llmResponsesHash: string,
  portalSubmissionsHash: string
): FormInput {
  return new FormInput({
    llmQuestionsHash: CircuitString.fromString(llmQuestionsHash),
    userInputsHash: CircuitString.fromString(userInputsHash),
    llmResponsesHash: CircuitString.fromString(llmResponsesHash),
    portalSubmissionsHash: CircuitString.fromString(portalSubmissionsHash),
    llmServerID: Field(12345),
    govServerID: Field(67890),
    tlsCertificateFingerprint: Field(123456789),
    tlsCertificateExpirationDate: Field(1735689600),
    currentTimestamp: Field(1625097600),
  });
}

async function processForm(
  map: MerkleMap,
  deployerAccount: PublicKey,
  formVerifier: FormVerifier,
  deployerKey: PrivateKey,
  input: FormInput
): Promise<MerkleMap> {
  const formHash = Poseidon.hash(input.toFields());

  let witness = map.getWitness(formHash);
  //   let witness: MerkleMapWitness = await axios.get(
  //     "http://localhost:3000/getContractRootWitness/" + formHash
  //   );

  console.log("Verifying form...");
  await executeTransaction(deployerAccount, deployerKey, async () => {
    formVerifier.verifyForm(input, witness);
  });
  console.log("form verified ✅");

  // Update our off-chain map
  map.set(formHash, Field(1));
  witness = map.getWitness(formHash);

  // Setting the value
  //   await axios.post("http://localhost:3000/updateContractRoot", {
  //     formHash,
  //   });
  console.log("Contract Root updated in backend ✅");

  // Getting the witness
  //   let witness_updated: MerkleMapWitness = await axios.get(
  //     "http://localhost:3000/getContractRootWitness/" + formHash
  //   );

  console.log("Getting verification result...");
  await executeTransaction(deployerAccount, deployerKey, async () => {
    formVerifier.getVerificationResult(input, witness);
  });

  await logEvents(formVerifier);

  return map;
}

async function executeTransaction(
  deployerAccount: PublicKey,
  deployerKey: PrivateKey,
  transactionFunction: () => Promise<void>
) {
  const transaction = await Mina.transaction(
    deployerAccount,
    transactionFunction
  );
  await transaction.prove();
  await transaction.sign([deployerKey]).send();
}

async function logEvents(formVerifier: FormVerifier) {
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
