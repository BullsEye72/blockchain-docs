const { vars } = require("hardhat/config");
const { expect } = require("chai");
const INFURA_API_KEY = vars.get("INFURA_API_KEY");
const SEPOLIA_PRIVATE_KEY = vars.get("SEPOLIA_PRIVATE_KEY");
const ETHERSCAN_API_KEY = vars.get("ETHERSCAN_API_KEY");

require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [SEPOLIA_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("testSepolia", "Test a function on a deployed contract")
  .addParam("ownerId", "The files owner ID")
  .setAction(async (taskArgs, hre) => {
    const contractAddress = "0x168D653D9e6A212c1f950Bbfb5b029fb2E3c3561";
    const fileFactory = await hre.ethers.getContractAt("FileManagerFactory", contractAddress);

    const files = await fileFactory.getFilesByOwner(taskArgs.ownerId);
    expect(files).to.be.an("array");
    console.log(files);
  });
