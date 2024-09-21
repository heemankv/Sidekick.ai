import express, { Request, Response } from "express";
import { InMemoryStorage } from "./storage";
import { getDataFromAvail, storeDataToAvail } from "./utils";
import { Field, MerkleMap, MerkleMapWitness } from "o1js";
import { PORT } from "./constants";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = PORT;
const worldCoinIdToBlockHash = new InMemoryStorage();
const worldCoinIdToTxn = new InMemoryStorage();
const merkle_map = new MerkleMap();

app.post("/updateContractRoot", (req: Request, res: Response) => {
  let { formHash } = req.body;
  if (!formHash) {
    return res.status(400).json({ error: "formHash is required" });
  }
  merkle_map.set(Field(formHash as string), Field(1));
  return res.json({ msg: "Contract root updated" });
});

app.get(
  "/getContractRootWitness/:form_input_hash",
  (req: Request, res: Response) => {
    let data = req.params;
    let result: MerkleMapWitness = merkle_map.getWitness(
      Field(data.form_input_hash)
    );
    return res.send(result);
  }
);

app.get("/getUserData", async (req: Request, res: Response) => {
  try {
    let { worldCoinId } = req.body;
    let data = await getDataFromAvail(
      worldCoinId,
      worldCoinIdToBlockHash,
      worldCoinIdToTxn
    );
    return res.json(data).status(200);
  } catch (error) {
    console.error(error);
  }
});

app.post("/submitUserData", async (req: Request, res: Response) => {
  try {
    let { worldCoinId, data_string } = req.body;
    await storeDataToAvail(
      worldCoinId,
      data_string,
      worldCoinIdToBlockHash,
      worldCoinIdToTxn
    );
    return res.json({ msg: "Data submitted successfully." });
  } catch (error) {
    console.error(error);
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
