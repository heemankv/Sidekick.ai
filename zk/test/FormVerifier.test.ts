// import { FormVerifier } from "../src/FormVerifier";
// import { FormInput } from "../src/FormInput";
// import { Mina, PrivateKey, PublicKey, AccountUpdate, Field } from "snarkyjs";
// import { expect } from "chai";

// describe("FormVerifier", () => {
//   let deployerAccount: PublicKey;
//   let deployerKey: PrivateKey;
//   let zkAppAddress: PublicKey;
//   let zkAppPrivateKey: PrivateKey;
//   let zkApp: FormVerifier;

//   // Set up the test environment before each test
//   beforeEach(async () => {
//     const Local = Mina.LocalBlockchain({ proofsEnabled: false });
//     Mina.setActiveInstance(Local);

//     // Get deployer account and key from the test accounts
//     ({ privateKey: deployerKey, publicKey: deployerAccount } =
//       Local.testAccounts[0]);

//     // Generate a new private key and get its public key for zkApp
//     zkAppPrivateKey = PrivateKey.random();
//     zkAppAddress = zkAppPrivateKey.toPublicKey();

//     // Initialize the FormVerifier smart contract
//     zkApp = new FormVerifier(zkAppAddress);
//   });

//   // Deploy the zkApp smart contract locally
//   async function localDeploy() {
//     const txn = await Mina.transaction(deployerAccount, () => {
//       AccountUpdate.fundNewAccount(deployerAccount);
//       zkApp.deploy();
//     });

//     await txn.prove();
//     await txn.sign([deployerKey, zkAppPrivateKey]).send();
//   }

//   // Test for smart contract deployment
//   it("generates and deploys the FormVerifier smart contract", async () => {
//     await localDeploy();
//     const actualVerificationResult = await zkApp.getVerificationResult();
//     expect(actualVerificationResult.toBoolean()).to.equal(false);
//   });

//   // Test for correct verification of a valid form input
//   it("correctly verifies a valid form input", async () => {
//     await localDeploy();

//     // Set expected values for the smart contract
//     const txn1 = await Mina.transaction(deployerAccount, () => {
//       zkApp.setExpectedServerIDs(Field(12345), Field(67890));
//       zkApp.setExpectedTlsCertificateFingerprint(Field(123456789));
//     });
//     await txn1.prove();
//     await txn1.sign([deployerKey]).send();

//     // Create a valid form input
//     const input = FormInput.create({
//       llmQuestionsHash: "hash1",
//       userInputsHash: "hash2",
//       llmResponsesHash: "hash3",
//       portalSubmissionsHash: "hash4",
//       llmServerID: Field(12345),
//       govServerID: Field(67890),
//       tlsCertificateFingerprint: Field(123456789),
//       tlsCertificateExpirationDate: Field(1735689600), // Future date
//       currentTimestamp: Field(1625097600), // Past date
//     });

//     // Verify the form input
//     const txn2 = await Mina.transaction(deployerAccount, () => {
//       zkApp.verifyForm(input);
//     });
//     await txn2.prove();
//     await txn2.sign([deployerKey]).send();

//     const actualVerificationResult = await zkApp.getVerificationResult();
//     expect(actualVerificationResult.toBoolean()).to.equal(true);
//   });

//   // Test for rejection of invalid form input with a zero hash
//   it("correctly rejects an invalid form input with zero hash", async () => {
//     await localDeploy();

//     // Set expected values for the smart contract
//     const txn1 = await Mina.transaction(deployerAccount, () => {
//       zkApp.setExpectedServerIDs(Field(12345), Field(67890));
//       zkApp.setExpectedTlsCertificateFingerprint(Field(123456789));
//     });
//     await txn1.prove();
//     await txn1.sign([deployerKey]).send();

//     // Create an invalid form input with a zero hash
//     const input = FormInput.create({
//       llmQuestionsHash: "0", // Zero hash
//       userInputsHash: "hash2",
//       llmResponsesHash: "hash3",
//       portalSubmissionsHash: "hash4",
//       llmServerID: Field(12345),
//       govServerID: Field(67890),
//       tlsCertificateFingerprint: Field(123456789),
//       tlsCertificateExpirationDate: Field(1735689600),
//       currentTimestamp: Field(1625097600),
//     });

//     // Verify the form input
//     const txn2 = await Mina.transaction(deployerAccount, () => {
//       zkApp.verifyForm(input);
//     });
//     await txn2.prove();
//     await txn2.sign([deployerKey]).send();

//     const actualVerificationResult = await zkApp.getVerificationResult();
//     expect(actualVerificationResult.toBoolean()).to.equal(false);
//   });

//   // Test for rejection of invalid form input with incorrect server ID
//   it("correctly rejects an invalid form input with incorrect server ID", async () => {
//     await localDeploy();

//     // Set expected values for the smart contract
//     const txn1 = await Mina.transaction(deployerAccount, () => {
//       zkApp.setExpectedServerIDs(Field(12345), Field(67890));
//       zkApp.setExpectedTlsCertificateFingerprint(Field(123456789));
//     });
//     await txn1.prove();
//     await txn1.sign([deployerKey]).send();

//     // Create an invalid form input with incorrect server ID
//     const input = FormInput.create({
//       llmQuestionsHash: "hash1",
//       userInputsHash: "hash2",
//       llmResponsesHash: "hash3",
//       portalSubmissionsHash: "hash4",
//       llmServerID: Field(99999), // Incorrect server ID
//       govServerID: Field(67890),
//       tlsCertificateFingerprint: Field(123456789),
//       tlsCertificateExpirationDate: Field(1735689600),
//       currentTimestamp: Field(1625097600),
//     });

//     // Verify the form input
//     const txn2 = await Mina.transaction(deployerAccount, () => {
//       zkApp.verifyForm(input);
//     });
//     await txn2.prove();
//     await txn2.sign([deployerKey]).send();

//     const actualVerificationResult = await zkApp.getVerificationResult();
//     expect(actualVerificationResult.toBoolean()).to.equal(false);
//   });

//   // Test for rejection of invalid form input with expired TLS certificate
//   it("correctly rejects an invalid form input with expired TLS certificate", async () => {
//     await localDeploy();

//     // Set expected values for the smart contract
//     const txn1 = await Mina.transaction(deployerAccount, () => {
//       zkApp.setExpectedServerIDs(Field(12345), Field(67890));
//       zkApp.setExpectedTlsCertificateFingerprint(Field(123456789));
//     });
//     await txn1.prove();
//     await txn1.sign([deployerKey]).send();

//     // Create an invalid form input with expired TLS certificate
//     const input = FormInput.create({
//       llmQuestionsHash: "hash1",
//       userInputsHash: "hash2",
//       llmResponsesHash: "hash3",
//       portalSubmissionsHash: "hash4",
//       llmServerID: Field(12345),
//       govServerID: Field(67890),
//       tlsCertificateFingerprint: Field(123456789),
//       tlsCertificateExpirationDate: Field(1625097500), // Expired date
//       currentTimestamp: Field(1625097600),
//     });

//     // Verify the form input
//     const txn2 = await Mina.transaction(deployerAccount, () => {
//       zkApp.verifyForm(input);
//     });
//     await txn2.prove();
//     await txn2.sign([deployerKey]).send();

//     const actualVerificationResult = await zkApp.getVerificationResult();
//     expect(actualVerificationResult.toBoolean()).to.equal(false);
//   });
// });
