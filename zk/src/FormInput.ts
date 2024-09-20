import { Field, Struct, CircuitString, Provable } from "o1js";

export class FormInput extends Struct({
  llmQuestionsHash: CircuitString,
  userInputsHash: CircuitString,
  llmResponsesHash: CircuitString,
  portalSubmissionsHash: CircuitString,
  llmServerID: Field,
  govServerID: Field,
  tlsCertificateFingerprint: Field,
  tlsCertificateExpirationDate: Field,
  currentTimestamp: Field,
}) {
  constructor(props: {
    llmQuestionsHash: CircuitString;
    userInputsHash: CircuitString;
    llmResponsesHash: CircuitString;
    portalSubmissionsHash: CircuitString;
    llmServerID: Field;
    govServerID: Field;
    tlsCertificateFingerprint: Field;
    tlsCertificateExpirationDate: Field;
    currentTimestamp: Field;
  }) {
    super(props);
  }

  toFields(): Field[] {
    return [
      this.llmQuestionsHash.hash(),
      this.userInputsHash.hash(),
      this.llmResponsesHash.hash(),
      this.portalSubmissionsHash.hash(),
      this.llmServerID,
      this.govServerID,
      this.tlsCertificateFingerprint,
      this.tlsCertificateExpirationDate,
      this.currentTimestamp,
    ];
  }

  static create(input: {
    llmQuestionsHash: string;
    userInputsHash: string;
    llmResponsesHash: string;
    portalSubmissionsHash: string;
    llmServerID: Field;
    govServerID: Field;
    tlsCertificateFingerprint: Field;
    tlsCertificateExpirationDate: Field;
    currentTimestamp: Field;
  }): FormInput {
    return new FormInput({
      llmQuestionsHash: CircuitString.fromString(input.llmQuestionsHash),
      userInputsHash: CircuitString.fromString(input.userInputsHash),
      llmResponsesHash: CircuitString.fromString(input.llmResponsesHash),
      portalSubmissionsHash: CircuitString.fromString(
        input.portalSubmissionsHash
      ),
      llmServerID: input.llmServerID,
      govServerID: input.govServerID,
      tlsCertificateFingerprint: input.tlsCertificateFingerprint,
      tlsCertificateExpirationDate: input.tlsCertificateExpirationDate,
      currentTimestamp: input.currentTimestamp,
    });
  }
}
