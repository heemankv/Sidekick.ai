import express, { Request, Response } from "express";
import { InMemoryStorage } from "./storage";
import { getDataFromAvail, storeDataToAvail } from "./utils";
import { PORT } from "./constants";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = PORT;
const worldCoinIdToBlockHash = new InMemoryStorage();
const worldCoinIdToTxn = new InMemoryStorage();

app.get("/getUserData", async (req: Request, res: Response) => {
  try {
    let { worldCoinId } = req.body;
    let data = await getDataFromAvail(
      worldCoinId,
      worldCoinIdToBlockHash,
      worldCoinIdToTxn
    );
    return res.send(data).status(200);
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
