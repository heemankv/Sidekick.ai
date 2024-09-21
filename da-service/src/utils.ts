import { initialize } from "avail-js-sdk";
import { InMemoryStorage } from "./storage";
import { AVAIL_ENDPOINT } from "./constants";
import { getAvailClient } from "./avail";
import { ISubmittableResult } from "@polkadot/types/types/extrinsic";
import { H256 } from "@polkadot/types/interfaces";

interface UserData {
  name?: string;
  dob?: string;
  gender?: string;
  email?: string;
}

export const getDataFromAvail = async (
  worldCoinId: string,
  worldCoinIdToBlockHash: InMemoryStorage,
  worldCoinIdToTxn: InMemoryStorage
): Promise<UserData> => {
  const block_hash = worldCoinIdToBlockHash.get(worldCoinId);
  if (block_hash == undefined) {
    return {};
  }

  const txn_hash = worldCoinIdToTxn.get(worldCoinId);
  if (txn_hash == undefined) {
    return {};
  }

  const api = await initialize(AVAIL_ENDPOINT);
  const block = await api.rpc.chain.getBlock(block_hash);

  const tx = block.block.extrinsics.find(
    (tx) => tx.hash.toHex() == txn_hash.toHex()
  );

  if (tx == undefined) {
    return {};
  }

  const dataHex = tx.method.args.map((a) => a.toString()).join(", ");
  let str = "";
  for (let n = 0; n < dataHex.length; n += 2) {
    str += String.fromCharCode(parseInt(dataHex.substring(n, n + 2), 16));
  }

  return JSON.parse(str) as UserData;
};

export const storeDataToAvail = async (
  worldCoinId: string,
  data: string,
  worldCoinIdToBlockHash: InMemoryStorage,
  worldCoinIdToTxn: InMemoryStorage
) => {
  let avail_client = await getAvailClient();

  const txResult = await new Promise<ISubmittableResult>((res) => {
    avail_client.api.tx.dataAvailability
      .submitData(data)
      .signAndSend(
        avail_client.account,
        avail_client.options,
        (result: ISubmittableResult) => {
          console.log(`Tx status: ${result.status}`);
          if (result.isFinalized || result.isError) {
            res(result);
          }
        }
      );
  });

  // Rejected Transaction handling
  if (txResult.isError) {
    console.log(`Transaction was not executed`);
    process.exit(1);
  }

  const [txHash, blockHash] = [
    txResult.txHash as H256,
    txResult.status.asFinalized as H256,
  ];
  console.log(`Tx Hash: ${txHash}, Block Hash: ${blockHash}`);

  worldCoinIdToBlockHash.set(worldCoinId, blockHash);
  worldCoinIdToTxn.set(worldCoinId, txHash);
};
