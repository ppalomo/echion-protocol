const path = require("path");
require("@nomiclabs/hardhat-waffle");
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
 module.exports = {
  solidity: "0.8.3",
  paths: {
    artifacts: '../src/artifacts',
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.REACT_APP_INFURA_API_KEY}`,
      accounts: [`0x${process.env.REACT_APP_DEPLOYER_PRIVATE_KEY}`]
    },
  }
};

