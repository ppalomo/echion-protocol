// npx hardhat run scripts/deploy.js --network localhost
// require('dotenv').config({path:__dirname+'../../.env'});
const hre = require("hardhat");
const path = require("path");
const replace = require('replace-in-file');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

async function main() {
  

  // console.log(stakingAddresses[0]);

  // EchionNFT (ERC721 NFT Token)
  const EchionNFT = await hre.ethers.getContractFactory("EchionNFT");
  const echionNFT = await EchionNFT.deploy();
  await echionNFT.deployed();
  await replaceContractAddress("EchionNFT", echionNFT.address);
  console.log("EchionNFT deployed to:", echionNFT.address);

  // // EchionToken (ERC20 Token)
  // const EchionToken = await hre.ethers.getContractFactory("EchionToken");
  // const echionToken = await EchionToken.deploy();
  // await echionToken.deployed();
  // await replaceContractAddress("EchionToken", echionToken.address);
  // console.log("EchionToken deployed to:", echionToken.address);

  // AaveStakingAdapter
  let stakingAdapter = null;
  let stakingAddresses = getAaveStakingAddresses(hre.network.name);
  if (stakingAddresses[0] != "") {
    const AaveStakingAdapter = await hre.ethers.getContractFactory("AaveStakingAdapter");
    const aaveStakingAdapter = await AaveStakingAdapter.deploy(stakingAddresses[0], stakingAddresses[1], stakingAddresses[2]);
    await aaveStakingAdapter.deployed();
    stakingAdapter = aaveStakingAdapter;
    await replaceContractAddress("AaveStakingAdapter", aaveStakingAdapter.address);
    console.log("AaveStakingAdapter deployed to:", aaveStakingAdapter.address);
  } else {
    console.log("AaveStakingAdapter not deployed");
  }

  // CompoundStakingAdapter
  stakingAddresses = getCompoundStakingAddresses(hre.network.name);
  if (stakingAddresses[0] != "") {
    const CompoundStakingAdapter = await hre.ethers.getContractFactory("CompoundStakingAdapter");
    const compoundStakingAdapter = await CompoundStakingAdapter.deploy(stakingAddresses[0]);
    await compoundStakingAdapter.deployed();
    if (stakingAdapter == null)
      stakingAdapter = compoundStakingAdapter;
    await replaceContractAddress("CompoundStakingAdapter", compoundStakingAdapter.address);
    console.log("CompoundStakingAdapter deployed to:", compoundStakingAdapter.address);
  } else {
    console.log("CompoundStakingAdapter not deployed");
  }

  const StandardLotteryPool = await ethers.getContractFactory("StandardLotteryPool");
  const standardLotteryPool = await StandardLotteryPool.deploy();
  await standardLotteryPool.deployed();
  await replaceContractAddress("StandardLotteryPool", standardLotteryPool.address);
  console.log("StandardLotteryPool deployed to:", standardLotteryPool.address);

  const YieldLotteryPool = await ethers.getContractFactory("YieldLotteryPool");
  const yieldLotteryPool = await YieldLotteryPool.deploy();
  await yieldLotteryPool.deployed();
  await replaceContractAddress("YieldLotteryPool", yieldLotteryPool.address);
  console.log("YieldLotteryPool deployed to:", yieldLotteryPool.address);

  // LotteryPoolFactory
  const LotteryPoolFactory = await hre.ethers.getContractFactory("LotteryPoolFactory");
  const lotteryPoolFactory = await upgrades.deployProxy(
        LotteryPoolFactory, 
        [stakingAdapter.address], 
        { initializer: 'initialize' });
  await lotteryPoolFactory.deployed();
  await replaceContractAddress("LotteryPoolFactory", lotteryPoolFactory.address);
  console.log("LotteryPoolFactory deployed to:", lotteryPoolFactory.address);

  await lotteryPoolFactory.addMasterPool(0, ethers.utils.formatBytes32String('STANDARD'), standardLotteryPool.address);
  await lotteryPoolFactory.addMasterPool(1, ethers.utils.formatBytes32String('YIELD'), yieldLotteryPool.address);
}

function getAaveStakingAddresses(network) {
  let lendingPoolAddressesProvider, wethGateway, aWethAddress;
  switch (network) {
    case 'mainnet':
    case 'localhost':
      lendingPoolAddressesProvider = "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5";
      wethGateway = "0xcc9a0B7c43DC2a5F023Bb9b738E45B0Ef6B06E04";
      aWethAddress = "0x030bA81f1c18d280636F32af80b9AAd02Cf0854e";
      break;
    case 'kovan':
      lendingPoolAddressesProvider = "0x88757f2f99175387ab4c6a4b3067c77a695b0349";
      wethGateway = "0xA61ca04DF33B72b235a8A28CfB535bb7A5271B70";
      aWethAddress = "0x87b1f4cf9BD63f7BBD3eE1aD04E8F52540349347";
      break;
    case 'matic':
      lendingPoolAddressesProvider = "0xd05e3E715d945B59290df0ae8eF85c1BdB684744";
      wethGateway = "0xbEadf48d62aCC944a06EEaE0A9054A90E5A7dc97";
      aWethAddress = "0x28424507fefb6f7f8E9D3860F56504E4e5f5f390";
      break;
    case 'mumbai':      
      lendingPoolAddressesProvider = "0x178113104fEcbcD7fF8669a0150721e231F0FD4B";
      wethGateway = "0xee9eE614Ad26963bEc1Bec0D2c92879ae1F209fA";
      aWethAddress = "0x7aE20397Ca327721F013BB9e140C707F82871b56";
      break;
    default:
      lendingPoolAddressesProvider = "";
      wethGateway = "";
      aWethAddress = "";
      break;
  }
  return [lendingPoolAddressesProvider, wethGateway, aWethAddress];
}

function getCompoundStakingAddresses(network) {
  let cEther;
  switch (network) {
    case 'mainnet':
    case 'localhost':
      cEther = "0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5";
      break;
    case 'kovan':
      cEther = "0x41b5844f4680a8c38fbb695b7f9cfd1f64474a72";
      break;
    case 'rinkeby':
      cEther = "0xd6801a1dffcd0a410336ef88def4320d6df1883e";
      break;
    default:
      cEther = "";
      break;
  }
  return [cEther];
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