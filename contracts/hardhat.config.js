require("@nomiclabs/hardhat-waffle");

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
    // mainnet: {
    //   url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
    //   accounts: [`0x${process.env.MAINNET_PRIVATE_KEY}`]
    // },
    // goerli: {
    //   url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
    //   accounts: [`0x${process.env.GOERLI_PRIVATE_KEY}`]
    // },
    // rinkeby: {
    //   url: `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
    //   accounts: [`0x${process.env.RINKEBY_PRIVATE_KEY}`]
    // },
    // ropsten: {
    //   url: `https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`,
    //   accounts: [`0x${process.env.ROPSTEN_PRIVATE_KEY}`],
    //   gasPrice: 0
    // },
    // mumbai: { //80001
    //   url: "https://rpc-mumbai.maticvigil.com",
    //   accounts: [`0x${process.env.MUMBAI_PRIVATE_KEY}`]
    // },
    // matic: { //137
    //   url: "https://rpc-mainnet.maticvigil.com",
    //   accounts: [`0x${process.env.MATIC_PRIVATE_KEY}`]
    // },
    // xdai: { //100
    //   url: "https://rpc-mumbai.maticvigil.com",
    //   accounts: [`0x${process.env.MATIC_PRIVATE_KEY}`]
    // }
  }
};

