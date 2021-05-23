// npx hardhat run scripts/deploy.js --network localhost
// require('dotenv').config({path:__dirname+'../../.env'});
const hre = require("hardhat");
const path = require("path");
const replace = require('replace-in-file');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

async function main() {
  // Deploying Greeter.sol
  const Greeter = await hre.ethers.getContractFactory("Greeter");
  const greeter = await Greeter.deploy("Hello, Hardhat!");
  await greeter.deployed();
  await replaceContractAddress("Greeter", greeter.address);
  console.log("Greeter deployed to:", greeter.address);
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
      console.log('Replacement results:', results);
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