import express, { Request, Response } from "express";
import {
  Field,
  MerkleMap,
  MerkleMapWitness,
  Poseidon,
  PrivateKey,
  PublicKey,
} from "o1js";
import { PRIVATE_KEY, SERVER_PORT, ZK_APP_PUBLIC_KEY } from "./constants";
import { createFormInput, executeTransaction } from ".";
import { FormVerifier } from "./FormVerifier";
import { InMemoryStorage } from "./storage";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const deployerPrivateKey = PrivateKey.fromBase58(PRIVATE_KEY);
const deployerPublicKey = deployerPrivateKey.toPublicKey();
const port = SERVER_PORT;
const merkle_map = new MerkleMap();
const zkAppPublicKey = PublicKey.fromBase58(ZK_APP_PUBLIC_KEY);
const formHashToTxnStorage = new InMemoryStorage();

app.post("/submitFormValidationProof", async (req: Request, res: Response) => {
  const { form_data } = req.body;

  try {
    let form = createFormInput(
      form_data.llmQuestionsHash,
      form_data.userInputsHash,
      form_data.llmResponsesHash,
      form_data.portalSubmissionsHash
    );
    const formHash = Poseidon.hash(form.toFields());
    let witness = merkle_map.getWitness(formHash);

    await FormVerifier.compile();

    const formVerifier = new FormVerifier(zkAppPublicKey);

    let txn_hash = await executeTransaction(
      deployerPublicKey,
      deployerPrivateKey,
      async () => {
        await formVerifier.verifyForm(form, witness);
      }
    );

    merkle_map.set(formHash, Field(1));

    formHashToTxnStorage.set(formHash.toString(), txn_hash);

    return res
      .json({ msg: "All the params are proved successfully" })
      .status(200);
  } catch (error) {
    console.error(error);
  }
});

app.get(
  "/getFormValidationTxn/:formHash",
  async (req: Request, res: Response) => {
    try {
      let { form_hash } = req.params;
      return res.json(formHashToTxnStorage.get(form_hash));
    } catch (error) {
      console.error(error);
    }
  }
);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
