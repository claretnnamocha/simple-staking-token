require("dotenv").config();
require("@nomiclabs/hardhat-ethers");
import "@nomicfoundation/hardhat-toolbox";
import { HardhatUserConfig } from "hardhat/config";
const { POLYGON_MUMBAI_RPC_PROVIDER, PRIVATE_KEY, POLYGONSCAN_API_KEY } =
  process.env;

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  networks: {
    hardhat: {},
    mumbai: {
      url: POLYGON_MUMBAI_RPC_PROVIDER,
      accounts: [`${PRIVATE_KEY}`],
    },
  },
  etherscan: {
    apiKey: POLYGONSCAN_API_KEY,
  },
};

export default config;
