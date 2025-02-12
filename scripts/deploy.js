const hre = require("hardhat");
const fs = require('fs');

async function main() {
  const LOCKMarketplace = await hre.ethers.getContractFactory("LOCKMarketplace");
  const lockMarketplace = await LOCKMarketplace.deploy();
  await lockMarketplace.deployed();
  console.log("LOCKMarketplace deployed to:", lockMarketplace.address);

  fs.writeFileSync('./config.js', `
  export const marketplaceAddress = "${lockMarketplace.address}"
  `)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
