"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormVerifier = void 0;
const o1js_1 = require("o1js");
const FormInput_1 = require("./FormInput");
class FormVerifier extends o1js_1.SmartContract {
    constructor() {
        super(...arguments);
        this.expectedLlmServerID = (0, o1js_1.State)();
        this.expectedGovServerID = (0, o1js_1.State)();
        this.expectedTlsCertificateFingerprint = (0, o1js_1.State)();
        this.mapRoot = (0, o1js_1.State)();
        this.events = {
            "form-verified": o1js_1.PublicKey,
            "verification-result": o1js_1.Bool,
        };
    }
    init() {
        super.init();
        this.expectedLlmServerID.set((0, o1js_1.Field)(0));
        this.expectedGovServerID.set((0, o1js_1.Field)(0));
        this.expectedTlsCertificateFingerprint.set((0, o1js_1.Field)(0));
        this.mapRoot.set(new o1js_1.MerkleMap().getRoot());
    }
    async verifyForm(input, witness) {
        const currentRoot = this.mapRoot.get();
        this.mapRoot.requireEquals(currentRoot);
        this.expectedLlmServerID.requireEquals(this.expectedLlmServerID.get());
        this.expectedGovServerID.requireEquals(this.expectedGovServerID.get());
        this.expectedTlsCertificateFingerprint.requireEquals(this.expectedTlsCertificateFingerprint.get());
        // Verify server IDs
        const llmServerIDCorrect = input.llmServerID.equals(this.expectedLlmServerID.get());
        const govServerIDCorrect = input.govServerID.equals(this.expectedGovServerID.get());
        // Verify TLS certificate
        const fingerprintCorrect = input.tlsCertificateFingerprint.equals(this.expectedTlsCertificateFingerprint.get());
        const notExpired = input.tlsCertificateExpirationDate.greaterThan(input.currentTimestamp);
        const zeroHash = o1js_1.CircuitString.fromString("0");
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
        const formHash = o1js_1.Poseidon.hash(input.toFields());
        const [rootBefore, key] = witness.computeRootAndKeyV2((0, o1js_1.Field)(0));
        rootBefore.assertEquals(currentRoot);
        key.assertEquals(formHash);
        const [rootAfter, _] = witness.computeRootAndKeyV2((0, o1js_1.Field)(isValid ? 1 : 0));
        this.mapRoot.set(rootAfter);
        this.emitEvent("verification-result", isValid);
    }
    async getVerificationResult(input, witness) {
        const currentRoot = this.mapRoot.get();
        this.mapRoot.requireEquals(currentRoot);
        const formHash = o1js_1.Poseidon.hash(input.toFields());
        const [witnessRoot, key] = witness.computeRootAndKeyV2((0, o1js_1.Field)(1));
        const rootsMatch = witnessRoot.equals(currentRoot);
        const keysMatch = key.equals(formHash);
        const [_, value] = witness.computeRootAndKeyV2((0, o1js_1.Field)(1));
        const result = rootsMatch.and(keysMatch);
        this.emitEvent("verification-result", result);
    }
    async setExpectedServerIDs(llmServerID, govServerID) {
        this.expectedLlmServerID.requireEquals(this.expectedLlmServerID.get());
        this.expectedGovServerID.requireEquals(this.expectedGovServerID.get());
        this.expectedLlmServerID.set(llmServerID);
        this.expectedGovServerID.set(govServerID);
    }
    async setExpectedTlsCertificateFingerprint(fingerprint) {
        this.expectedTlsCertificateFingerprint.requireEquals(this.expectedTlsCertificateFingerprint.get());
        this.expectedTlsCertificateFingerprint.set(fingerprint);
    }
}
exports.FormVerifier = FormVerifier;
__decorate([
    (0, o1js_1.state)(o1js_1.Field),
    __metadata("design:type", Object)
], FormVerifier.prototype, "expectedLlmServerID", void 0);
__decorate([
    (0, o1js_1.state)(o1js_1.Field),
    __metadata("design:type", Object)
], FormVerifier.prototype, "expectedGovServerID", void 0);
__decorate([
    (0, o1js_1.state)(o1js_1.Field),
    __metadata("design:type", Object)
], FormVerifier.prototype, "expectedTlsCertificateFingerprint", void 0);
__decorate([
    (0, o1js_1.state)(o1js_1.Field),
    __metadata("design:type", Object)
], FormVerifier.prototype, "mapRoot", void 0);
__decorate([
    o1js_1.method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [FormInput_1.FormInput, o1js_1.MerkleMapWitness]),
    __metadata("design:returntype", Promise)
], FormVerifier.prototype, "verifyForm", null);
__decorate([
    o1js_1.method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [FormInput_1.FormInput,
        o1js_1.MerkleMapWitness]),
    __metadata("design:returntype", Promise)
], FormVerifier.prototype, "getVerificationResult", null);
__decorate([
    o1js_1.method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [o1js_1.Field, o1js_1.Field]),
    __metadata("design:returntype", Promise)
], FormVerifier.prototype, "setExpectedServerIDs", null);
__decorate([
    o1js_1.method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [o1js_1.Field]),
    __metadata("design:returntype", Promise)
], FormVerifier.prototype, "setExpectedTlsCertificateFingerprint", null);
