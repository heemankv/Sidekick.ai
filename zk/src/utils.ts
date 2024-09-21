import { fetchTransactionStatus } from "o1js";
import { GRAPH_QL_RPC } from "./constants";

export async function waitForTransaction(txHash: string) {
  let status = "PENDING";
  while (status !== "INCLUDED") {
    try {
      const result = await fetchTransactionStatus(txHash, GRAPH_QL_RPC);
      status = result;
      if (status === "INCLUDED") {
        console.log("Transaction included in block!");
        return result;
      }
      console.log("Transaction still pending, waiting...");
      await new Promise((resolve) => setTimeout(resolve, 30000));
    } catch (error) {
      console.error("Error checking transaction status:", error);
      await new Promise((resolve) => setTimeout(resolve, 30000));
    }
  }
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
