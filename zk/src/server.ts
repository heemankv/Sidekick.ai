import express, { Request, Response } from "express";
import {
  fetchAccount,
  Field,
  MerkleMap,
  Mina,
  Poseidon,
  PrivateKey,
  PublicKey,
} from "o1js";
import {
  GRAPH_QL_RPC,
  PRIVATE_KEY,
  SERVER_PORT,
  STATE_FILE_NAME,
  ZK_APP_PUBLIC_KEY,
} from "./constants";
import { createFormInput } from ".";
import { FormVerifier } from "./FormVerifier";
import { InMemoryStorage } from "./storage";
import * as fs from "fs/promises";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const deployerPrivateKey = PrivateKey.fromBase58(PRIVATE_KEY);
const deployerPublicKey = deployerPrivateKey.toPublicKey();
const port = SERVER_PORT;
const merkle_map = new MerkleMap();
const zkAppPublicKey = PublicKey.fromBase58(ZK_APP_PUBLIC_KEY);
const formHashToTxnStorage = new InMemoryStorage();

const network = Mina.Network(GRAPH_QL_RPC);
Mina.setActiveInstance(network);

app.post("/submitFormValidationProof", async (req: Request, res: Response) => {
  const {
    llmQuestionsHash,
    userInputsHash,
    llmResponsesHash,
    portalSubmissionsHash,
  } = req.body;

  try {
    let form = createFormInput(
      llmQuestionsHash,
      userInputsHash,
      llmResponsesHash,
      portalSubmissionsHash
    );
    const formHash = Poseidon.hash(form.toFields());
    let witness = merkle_map.getWitness(formHash);

    await FormVerifier.compile();

    await fetchAccount({ publicKey: zkAppPublicKey });
    const formVerifier = new FormVerifier(zkAppPublicKey);

    console.log(">>>>> Verifying form...");
    const verifyTxn = await Mina.transaction(
      {
        sender: deployerPublicKey,
        fee: "20000000000",
      },
      async () => {
        await formVerifier.verifyForm(form, witness);
      }
    );

    await verifyTxn.prove();
    const signedVerifyTxn = await verifyTxn.sign([deployerPrivateKey]).send();

    console.log("Verify transaction hash:", signedVerifyTxn.hash);

    merkle_map.set(formHash, Field(1));
    await updateJsonArrayFile(STATE_FILE_NAME, {
      formHash: formHash.toString(),
      value: 1,
    });

    formHashToTxnStorage.set(formHash.toString(), signedVerifyTxn.hash);

    return res
      .json({
        msg: "All the params are proved successfully",
        form_hash: formHash.toString(),
      })
      .status(200);
  } catch (error) {
    console.error(error);
    return res.send(error);
  }
});

app.get(
  "/getFormValidationTxn/:formHash",
  async (req: Request, res: Response) => {
    try {
      let { formHash } = req.params;
      let val = formHashToTxnStorage.get(formHash);
      console.log(">>>> ", val, formHash);
      return res.send(formHashToTxnStorage.get(formHash));
    } catch (error) {
      console.error(error);
    }
  }
);

// =====================================================
// Utils function
// =====================================================

async function updateJsonArrayFile(
  filename: string,
  newItem: any
): Promise<void> {
  try {
    let data: any[];
    try {
      const jsonString = await fs.readFile(filename, "utf8");
      data = JSON.parse(jsonString);

      if (!Array.isArray(data)) {
        console.warn("File does not contain an array. Initializing new array.");
        data = [];
      }
    } catch (error) {
      console.warn("File not found or invalid JSON. Initializing new array.");
      data = [];
    }
    data.push(newItem);
    const updatedJsonString = JSON.stringify(data, null, 2);
    await fs.writeFile(filename, updatedJsonString, "utf8");
    console.log("Successfully updated and saved the file");
  } catch (err) {
    console.error("Error updating file:", err);
  }
}

async function replayState(filename: string) {
  let data: any[];
  try {
    const jsonString = await fs.readFile(filename, "utf8");
    data = JSON.parse(jsonString);

    if (!Array.isArray(data)) {
      console.warn("File does not contain an array. Initializing new array.");
      data = [];
    }

    data.forEach((point: { formHash: string; value: number }) => {
      merkle_map.set(Field(point.formHash), Field(point.value));
    });
  } catch (error) {
    console.warn("File not found or invalid JSON. Initializing new array.");
    data = [];
  }
}

app.listen(port, async () => {
  await replayState(STATE_FILE_NAME);
  console.log(`Server is running on http://localhost:${port}`);
});
