"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormInput = void 0;
const o1js_1 = require("o1js");
class FormInput extends (0, o1js_1.Struct)({
    llmQuestionsHash: o1js_1.CircuitString,
    userInputsHash: o1js_1.CircuitString,
    llmResponsesHash: o1js_1.CircuitString,
    portalSubmissionsHash: o1js_1.CircuitString,
    llmServerID: o1js_1.Field,
    govServerID: o1js_1.Field,
    tlsCertificateFingerprint: o1js_1.Field,
    tlsCertificateExpirationDate: o1js_1.Field,
    currentTimestamp: o1js_1.Field,
}) {
    constructor(props) {
        super(props);
    }
    toFields() {
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
    static create(input) {
        return new FormInput({
            llmQuestionsHash: o1js_1.CircuitString.fromString(input.llmQuestionsHash),
            userInputsHash: o1js_1.CircuitString.fromString(input.userInputsHash),
            llmResponsesHash: o1js_1.CircuitString.fromString(input.llmResponsesHash),
            portalSubmissionsHash: o1js_1.CircuitString.fromString(input.portalSubmissionsHash),
            llmServerID: input.llmServerID,
            govServerID: input.govServerID,
            tlsCertificateFingerprint: input.tlsCertificateFingerprint,
            tlsCertificateExpirationDate: input.tlsCertificateExpirationDate,
            currentTimestamp: input.currentTimestamp,
        });
    }
}
exports.FormInput = FormInput;
