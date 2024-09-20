import {
  SmartContract,
  method,
  Bool,
  state,
  State,
  Field,
  CircuitString,
  Poseidon,
  MerkleMap,
  MerkleMapWitness,
  PublicKey,
} from "o1js";
import { FormInput } from "./FormInput";

export class FormVerifier extends SmartContract {
  @state(Field) expectedLlmServerID = State<Field>();
  @state(Field) expectedGovServerID = State<Field>();
  @state(Field) expectedTlsCertificateFingerprint = State<Field>();
  @state(Field) mapRoot = State<Field>();

  events = {
    "form-verified": PublicKey,
    "verification-result": Bool,
  };

  init() {
    super.init();
    this.expectedLlmServerID.set(Field(0));
    this.expectedGovServerID.set(Field(0));
    this.expectedTlsCertificateFingerprint.set(Field(0));
    this.mapRoot.set(new MerkleMap().getRoot());
  }

  @method async verifyForm(input: FormInput, witness: MerkleMapWitness) {
    const currentRoot = this.mapRoot.get();
    this.mapRoot.requireEquals(currentRoot);

    this.expectedLlmServerID.requireEquals(this.expectedLlmServerID.get());
    this.expectedGovServerID.requireEquals(this.expectedGovServerID.get());
    this.expectedTlsCertificateFingerprint.requireEquals(
      this.expectedTlsCertificateFingerprint.get()
    );

    // Verify server IDs
    const llmServerIDCorrect = input.llmServerID.equals(
      this.expectedLlmServerID.get()
    );
    const govServerIDCorrect = input.govServerID.equals(
      this.expectedGovServerID.get()
    );

    // Verify TLS certificate
    const fingerprintCorrect = input.tlsCertificateFingerprint.equals(
      this.expectedTlsCertificateFingerprint.get()
    );
    const notExpired = input.tlsCertificateExpirationDate.greaterThan(
      input.currentTimestamp
    );

    const zeroHash = CircuitString.fromString("0");
    const hashesValid = input.llmQuestionsHash
      .equals(zeroHash)
      .not()
      .and(input.userInputsHash.equals(zeroHash).not())
      .and(input.llmResponsesHash.equals(zeroHash).not())
      .and(input.portalSubmissionsHash.equals(zeroHash).not());

    const isValid = llmServerIDCorrect
      .and(govServerIDCorrect)
      .and(fingerprintCorrect)
      .and(notExpired)
      .and(hashesValid);

    const formHash = Poseidon.hash(input.toFields());

    const [rootBefore, key] = witness.computeRootAndKeyV2(Field(0));

    rootBefore.assertEquals(currentRoot);
    key.assertEquals(formHash);
    const [rootAfter, _] = witness.computeRootAndKeyV2(Field(isValid ? 1 : 0));
    this.mapRoot.set(rootAfter);
    this.emitEvent("verification-result", isValid);
  }

  @method async getVerificationResult(
    input: FormInput,
    witness: MerkleMapWitness
  ) {
    const currentRoot = this.mapRoot.get();
    this.mapRoot.requireEquals(currentRoot);
    const formHash = Poseidon.hash(input.toFields());
    const [witnessRoot, key] = witness.computeRootAndKeyV2(Field(1));
    const rootsMatch = witnessRoot.equals(currentRoot);
    const keysMatch = key.equals(formHash);
    const [_, value] = witness.computeRootAndKeyV2(Field(1));
    const result = rootsMatch.and(keysMatch);
    this.emitEvent("verification-result", result);
  }

  @method async setExpectedServerIDs(llmServerID: Field, govServerID: Field) {
    this.expectedLlmServerID.requireEquals(this.expectedLlmServerID.get());
    this.expectedGovServerID.requireEquals(this.expectedGovServerID.get());

    this.expectedLlmServerID.set(llmServerID);
    this.expectedGovServerID.set(govServerID);
  }

  @method async setExpectedTlsCertificateFingerprint(fingerprint: Field) {
    this.expectedTlsCertificateFingerprint.requireEquals(
      this.expectedTlsCertificateFingerprint.get()
    );

    this.expectedTlsCertificateFingerprint.set(fingerprint);
  }
}
