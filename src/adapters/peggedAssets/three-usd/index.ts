const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
} from "../peggedAsset.type";
const axios = require("axios");
const retry = require("async-retry");

type ChainContracts = {
  [chain: string]: {
    [contract: string]: string[];
  };
};

const chainContracts: ChainContracts = {
  karura: {
    issued: ["0x0000000000000000000300000000000000000001"],
  },
};

async function karuraMinted(address: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const res = await retry(
      async (_bail: any) =>
        await axios.get(
          `https://blockscout.karura.network/api?module=token&action=getToken&contractaddress=getToken&contractaddress=${address}`
        )
    );
    const supply = res.data.result.totalSupply / 10 ** decimals;
    sumSingleBalance(balances, "peggedUSD", supply, "issued", false);
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  karura: {
    minted: karuraMinted(chainContracts.karura.issued[0], 12),
    unreleased: async () => ({}),
  },
};

export default adapter;
