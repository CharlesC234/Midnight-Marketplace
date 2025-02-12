require("@nomiclabs/hardhat-waffle");
const fs = require('fs');
require("dotenv").config();
// const infuraId = fs.readFileSync(".infuraid").toString().trim() || "";

const { ALCHEMY_API_URL, PRIVATE_KEY } = process.env;

module.exports = {
  networks: {
    matic: {
      url: ALCHEMY_API_URL,
      accounts: [`0x${PRIVATE_KEY}`]
    }
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 2000
      }
    }
  }
};

