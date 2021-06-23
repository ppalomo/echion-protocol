// npx hardhat run scripts/deploy.js --network localhost
// require('dotenv').config({path:__dirname+'../../.env'});
const hre = require("hardhat");
const path = require("path");
const replace = require('replace-in-file');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

async function main() {
  // EchionNFT (ERC721 NFT Token)
  const EchionNFT = await hre.ethers.getContractFactory("EchionNFT");
  const echionNFT = await EchionNFT.deploy();
  await echionNFT.deployed();
  await replaceContractAddress("EchionNFT", echionNFT.address);
  console.log("EchionNFT deployed to:", echionNFT.address);

  // EchionToken (ERC20 Token)
  const EchionToken = await hre.ethers.getContractFactory("EchionToken");
  const echionToken = await EchionToken.deploy();
  await echionToken.deployed();
  await replaceContractAddress("EchionToken", echionToken.address);
  console.log("EchionToken deployed to:", echionToken.address);

  // LotteryPoolFactory
  const LotteryPoolFactory = await hre.ethers.getContractFactory("LotteryPoolFactory");
  const lotteryPoolFactory = await LotteryPoolFactory.deploy();
  await lotteryPoolFactory.deployed();
  await replaceContractAddress("LotteryPoolFactory", lotteryPoolFactory.address);
  console.log("LotteryPoolFactory deployed to:", lotteryPoolFactory.address);
}

// Replacing contract's address in .env file
async function replaceContractAddress(contract, newAddress) {
  let envFilePath = path.resolve(__dirname, '../../.env');
    
  const uri = `REACT_APP_${contract.toUpperCase()}_${hre.network.name.toUpperCase()}_ADDRESS`;
  const address = process.env[uri];

  if (address == undefined) {
    fs.appendFileSync(envFilePath, `\n${uri}=${newAddress}`);
  } else {
    const options = {
      files: envFilePath,
      from: address,
      to: newAddress,
    };

    try {
      const results = await replace(options)
      //console.log('Replacement results:', results);
    }
    catch (error) {
      console.error('Error occurred:', error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });