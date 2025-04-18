import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config(); // To load your private key from .env

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    curtis: {
      url: "https://curtis.rpc.caldera.xyz/http",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};

export default config;
