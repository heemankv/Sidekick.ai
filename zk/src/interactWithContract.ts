import {
  Mina,
  PrivateKey,
  PublicKey,
  Field,
  CircuitString,
  MerkleMap,
  Poseidon,
} from "o1js";
import { FormVerifier } from "./FormVerifier";
import { FormInput } from "./FormInput";
import { GRAPH_QL_RPC, PRIVATE_KEY, ZK_APP_PUBLIC_KEY } from "./constants";
import { delay } from "./utils";

async function main() {
  console.log("o1js loaded");

  // Read the deployer's private key from a file
  const deployerPrivateKey = PrivateKey.fromBase58(PRIVATE_KEY);
  const deployerPublicKey = deployerPrivateKey.toPublicKey();

  // The public key of the deployed contract (you should have this from the deployment)
  const zkAppPublicKey = PublicKey.fromBase58(ZK_APP_PUBLIC_KEY);

  // Choose the network (local or real network)
  const useLocalBlockchain = false; // Set this to false to use a real network

  if (useLocalBlockchain) {
    const Local = await Mina.LocalBlockchain({ proofsEnabled: false });
    Mina.setActiveInstance(Local);
  } else {
    // Replace with the actual network endpoint
    const network = Mina.Network(GRAPH_QL_RPC);
    Mina.setActiveInstance(network);
  }

  console.log(">>>>> Compiling smart contract...");
  await FormVerifier.compile();

  // Initialize the contract
  const formVerifier = new FormVerifier(zkAppPublicKey);

  // Create a sample form input
  const input = new FormInput({
    llmQuestionsHash: CircuitString.fromString("hash1"),
    userInputsHash: CircuitString.fromString("hash2"),
    llmResponsesHash: CircuitString.fromString("hash3"),
    portalSubmissionsHash: CircuitString.fromString("hash4"),
    llmServerID: Field(12345),
    govServerID: Field(67890),
    tlsCertificateFingerprint: Field(123456789),
    tlsCertificateExpirationDate: Field(1735689600), // Example: December 31, 2024
    currentTimestamp: Field(1625097600), // Example: July 1, 2021
  });

  // Create a MerkleMap for the witness
  const map = new MerkleMap();
  const formHash = Poseidon.hash(input.toFields());
  const witness = map.getWitness(formHash);

  console.log(">>>>> Verifying form...");
  const verifyTxn = await Mina.transaction(
    {
      sender: deployerPublicKey,
      fee: "20000000000",
    },
    async () => {
      await formVerifier.verifyForm(input, witness);
    }
  );

  await verifyTxn.prove();
  const signedVerifyTxn = await verifyTxn.sign([deployerPrivateKey]).send();

  console.log("Verify transaction hash:", signedVerifyTxn.hash);

  if (signedVerifyTxn.status === "pending") {
    await delay(360 * 1000);

    console.log("Form verification transaction successful!");

    // Wait for the transaction to be included in a block
    await signedVerifyTxn.wait();

    // Now get the verification result
    console.log("Getting verification result...");
    const resultTxn = await Mina.transaction(
      {
        sender: deployerPublicKey,
        fee: "20000000000",
      },
      async () => {
        await formVerifier.getVerificationResult(input, witness);
      }
    );

    await resultTxn.prove();
    const signedResultTxn = await resultTxn.sign([deployerPrivateKey]).send();

    console.log("Result transaction hash:", signedResultTxn.hash);

    if (signedResultTxn.status === "pending") {
      console.log("Result retrieval transaction successful!");

      // Wait for the transaction to be included in a block
      await signedResultTxn.wait();

      // Fetch and display events
      const events = await formVerifier.fetchEvents();
      const verificationResults = events.filter(
        (e) => e.type === "verification-result"
      );
      if (verificationResults.length > 0) {
        const lastResult = verificationResults[verificationResults.length - 1];
        console.log("Verification result:", lastResult.event.data);
      } else {
        console.log("No verification result events found");
      }
    } else {
      console.error(
        "Failed to retrieve verification result:",
        signedResultTxn.status
      );
    }
  } else {
    console.error("Failed to verify form:", signedVerifyTxn.status);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
