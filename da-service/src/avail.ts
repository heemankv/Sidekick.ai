import { ApiPromise, getKeyringFromSeed, initialize } from "avail-js-sdk";
import { AVAIL_ENDPOINT, AVAIL_ID, AVAIL_SEED } from "./constants";
import { KeyringPair } from "@polkadot/keyring/types";

interface AvailClientConfig {
  api: ApiPromise;
  account: KeyringPair;
  app_id: string;
  options: { app_id: string; nonce: number };
}

export const getAvailClient = async (): Promise<AvailClientConfig> => {
  const api = await initialize(AVAIL_ENDPOINT);
  const account = getKeyringFromSeed(AVAIL_SEED);
  const app_id = AVAIL_ID;
  const options = { app_id, nonce: -1 };

  return {
    api,
    account,
    app_id,
    options,
  };
};
