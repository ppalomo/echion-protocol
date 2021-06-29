const { ethers, upgrades } = require("hardhat");
const { use, expect, assert } = require("chai");
const { solidity } = require("ethereum-waffle");

var BigNumber = require('big-number');

use(solidity);

const LotteryPoolType = {
	DIRECT: 0,
	STAKING: 1
}

const LotteryStatus = { 
    OPEN: 0,
    STAKING: 1,
    CLOSED: 2,
    CANCELLED: 3
}

describe("LotteryPoolFactory", function () {
  let LotteryPoolFactory, LotteryPool, EchionNFT, LotteryPoolStaking;
  let lotteryPoolFactory, nft, lotteryPoolStaking;
  let ticketPrice, minAmount;
  let imageURI;
  let metadataURI;
  let owner;
  let addr1;
  let addr2;
  let addrs;
  ticketPrice = ethers.utils.parseEther('0.1');
  minAmount = ethers.utils.parseEther('0.1');
  imageURI = "https://ipfs.io/ipfs/QmWNcYhEcggdm1TFt2m6WmGqqQwfFXudr5eFzKPtm1nYwq";
  metadataURI = "https://ipfs.io/ipfs/QmUCxDBKCrx2JXV4ZNYLwhUPXqTvRAu6Zceoh1FNVumoec";

  beforeEach(async function () {
    
    // Deploying contracts
    EchionNFT = await ethers.getContractFactory("EchionNFT");
    nft = await EchionNFT.deploy();
    expect(nft.address).to.properAddress;

    LotteryPoolStaking = await ethers.getContractFactory("LotteryPoolStaking");
    lotteryPoolStaking = await LotteryPoolStaking.deploy("0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5", "0xcc9a0B7c43DC2a5F023Bb9b738E45B0Ef6B06E04", "0x030bA81f1c18d280636F32af80b9AAd02Cf0854e");
    expect(lotteryPoolStaking.address).to.properAddress;

    LotteryPoolFactory = await ethers.getContractFactory("LotteryPoolFactory");
    lotteryPoolFactory = await LotteryPoolFactory.deploy(lotteryPoolStaking.address);
    expect(lotteryPoolFactory.address).to.properAddress;

    await lotteryPoolFactory.setMinDaysOpen(0);    

    // Getting test accounts
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // NFT approvals
    await nft.connect(addrs[1]).mint(imageURI, metadataURI);
    await nft.connect(addrs[1]).setApprovalForAll(lotteryPoolFactory.address, true);
    expect(await nft.ownerOf(0)).to.equal(addrs[1].address);

    await nft.connect(addrs[2]).mint(imageURI, metadataURI);
    await nft.connect(addrs[2]).setApprovalForAll(lotteryPoolFactory.address, true);
    expect(await nft.ownerOf(1)).to.equal(addrs[2].address);
  });

  // it("Should create a new lottery", async function () {
  //   // Act
  //   await expect(
  //     lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.DIRECT, minAmount)
  //   ).to.emit(lotteryPoolFactory, 'LotteryCreated');

  //   await expect(
  //     lotteryPoolFactory.connect(addrs[2]).createLottery(nft.address, 1, ticketPrice, LotteryPoolType.DIRECT, minAmount)
  //   ).to.emit(lotteryPoolFactory, 'LotteryCreated');

  //   let lotteries = [await _getLotteryPool(0), await _getLotteryPool(1)];

  //   // Assert
  //   expect(await lotteryPoolFactory.numberOfActiveLotteries()).to.equal(2);
  //   expect(await lotteries[0].status()).to.equal(LotteryStatus.OPEN);
  //   expect(await lotteries[0].creator()).to.equal(addrs[1].address);
  //   expect(await lotteries[1].creator()).to.equal(addrs[2].address);
  // });

  // it("Should buy lottery tickets", async function () {
  //   // Arrange
  //   await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.DIRECT, minAmount);        
  //   let lotteries = [await _getLotteryPool(0)];

  //   // Act
  //   await expect(
  //     lotteries[0].connect(addr1).buyTickets(2, {value: ethers.utils.parseEther('0.2')})
  //   ).to.emit(lotteries[0], 'TicketsBought');
  //   await lotteries[0].connect(addr2).buyTickets(1, {value: ethers.utils.parseEther('0.1')});
    
  //   // Assert
  //   expect(await lotteries[0].numberOfTickets()).to.equal(3);
  //   expect(await lotteries[0].ticketsOf(addr1.address)).to.equal(2)
  //   expect(await lotteries[0].ticketsOf(addr2.address)).to.equal(1)
  //   expect(await lotteries[0].getBalance()).to.equal(ethers.utils.parseEther('0.3'));
  // });

  // it("Shouldn't buy a ticket if the lottery is not open", async function () {    
  //   await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.STAKING, minAmount);
  //   await lotteryPoolFactory.connect(addrs[1]).launchStaking(0);

  //   let lotteries = [await _getLotteryPool(0)];

  //   await expect(
  //     lotteries[0].connect(addr1).buyTickets(1, {value: ethers.utils.parseEther('0.1')})
  //   ).to.be.revertedWith('The lottery pool is not open');
  // });

  // it("Should update total balance when buying tickets", async function () {
  //   // Arrange
  //   await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.DIRECT, minAmount);
  //   await lotteryPoolFactory.connect(addrs[2]).createLottery(nft.address, 1, ticketPrice, LotteryPoolType.DIRECT, minAmount);
  //   let lotteries = [await _getLotteryPool(0), await _getLotteryPool(1)];

  //   // Act
  //   await lotteries[0].connect(addr1).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
  //   await lotteries[0].connect(addr2).buyTickets(1, {value: ethers.utils.parseEther('0.1')});
  //   await lotteries[1].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
  //   await lotteries[1].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
    
  //   // Assert
  //   expect(await lotteryPoolFactory.totalBalance()).to.equal(ethers.utils.parseEther('0.8'));
  // });

  // it("Should cancel tickets", async function () {
  //   // Arrange
  //   await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.DIRECT, minAmount);
  //   let lotteries = [await _getLotteryPool(0)];

  //   // Act
  //   await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
  //   await lotteries[0].connect(addr2).buyTickets(1, {value: ethers.utils.parseEther('0.1')});
  //   await expect(
  //     lotteries[0].connect(addr1).cancelTickets(2)
  //   ).to.emit(lotteries[0], 'TicketsCancelled');
    
  //   // Assert
  //   expect(await lotteries[0].numberOfTickets()).to.equal(2);
  //   expect(await lotteries[0].ticketsOf(addr1.address)).to.equal(1)
  //   expect(await lotteries[0].getBalance()).to.equal(ethers.utils.parseEther('0.2'));
  // });

  // it("Shouldn't cancel more tickets than tickets bought", async function () {
  //   // Arrange
  //   await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.STAKING, minAmount);
  //   let lotteries = [await _getLotteryPool(0)];
  //   await lotteries[0].connect(addr1).buyTickets(2, {value: ethers.utils.parseEther('0.2')})

  //   // Assert
  //   await expect(
  //     lotteries[0].connect(addr1).cancelTickets(3)
  //   ).to.be.revertedWith('You do not have enough tickets');
  // });

  // it("Shouldn't cancel tickets if the lottery is not open", async function () {
  //   // Arrange
  //   await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.STAKING, minAmount);
  //   let lotteries = [await _getLotteryPool(0)];
  //   await lotteries[0].connect(addr1).buyTickets(2, {value: ethers.utils.parseEther('0.2')})
    
  //   // Act
  //   await lotteryPoolFactory.connect(addrs[1]).launchStaking(0);

  //   // Assert
  //   await expect(
  //     lotteries[0].connect(addr1).cancelTickets(2)
  //   ).to.be.revertedWith('The lottery pool is not open');
  // });

  // it("Should update total balance when cancelling tickets", async function () {
  //   // Arrange
  //   await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.DIRECT, minAmount);
  //   await lotteryPoolFactory.connect(addrs[2]).createLottery(nft.address, 1, ticketPrice, LotteryPoolType.DIRECT, minAmount);
  //   let lotteries = [await _getLotteryPool(0), await _getLotteryPool(1)];

  //   // Act
  //   await lotteries[0].connect(addr1).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
  //   await lotteries[0].connect(addr2).buyTickets(1, {value: ethers.utils.parseEther('0.1')});
  //   await lotteries[1].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
  //   await lotteries[1].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
  //   await lotteries[0].connect(addr1).cancelTickets(1);
  //   await lotteries[1].connect(addr2).cancelTickets(1);
    
  //   // Assert
  //   expect(await lotteryPoolFactory.totalBalance()).to.equal(ethers.utils.parseEther('0.6'));
  // });

  // it("Should stake a lottery", async function () {
  //   // Arrange
  //   await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.STAKING, minAmount);
  //   let lotteries = [await _getLotteryPool(0)];

  //   // Act
  //   await expect(
  //     lotteryPoolFactory.connect(addrs[1]).launchStaking(0)
  //   ).to.emit(lotteryPoolFactory, 'LotteryStaked');
    
  //   // Assert
  //   expect(await lotteries[0].status()).to.equal(LotteryStatus.STAKING);
  // });

  // it("Shouldn't stake a lottery if sender isn't the owner", async function () {
  //   // Arrange
  //   await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.STAKING, minAmount);

  //   // Act
  //   await expect(
  //     lotteryPoolFactory.connect(addr2).launchStaking(0)
  //   ).to.be.revertedWith('You are not the owner of the lottery');
  // });

  // it("Shouldn't stake a lottery if minimum days open hasn't been reached", async function () {
  //   // Arrange
  //   await lotteryPoolFactory.setMinDaysOpen(7);
  //   await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.STAKING, minAmount);

  //   // Act
  //   await expect(
  //     lotteryPoolFactory.connect(addrs[1]).launchStaking(0)
  //   ).to.be.revertedWith('You must wait the minimum open days');
  // });

  // it("Shouldn't stake a lottery if pool type isn't compatible", async function () {
  //   // Arrange
  //   await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.DIRECT, minAmount);

  //   // Act
  //   await expect(
  //     lotteryPoolFactory.connect(addrs[1]).launchStaking(0)
  //   ).to.be.revertedWith('Lottery pool type is not compatible with staking');
  // });

  // it("Should declare a winner in a direct lottery pool", async function () {
  //   await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.DIRECT, minAmount);
  //   let numberOfActiveLotteries = await lotteryPoolFactory.numberOfActiveLotteries();
  //   let lotteries = [await _getLotteryPool(0)];
    
  //   await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
  //   await lotteries[0].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
  //   await lotteries[0].connect(addrs[0]).buyTickets(1, {value: ethers.utils.parseEther('0.1')});

  //   await lotteryPoolFactory.connect(addrs[1]).declareWinner(0);

  //   expect([addr1.address, addr2.address, addrs[0].address]).to.include(await lotteries[0].winner());
  //   expect(await lotteries[0].status()).to.equal(LotteryStatus.CLOSED);
  //   expect(await lotteryPoolFactory.numberOfActiveLotteries()).to.equal(numberOfActiveLotteries - 1);
  //   expect(await lotteries[0].finalPrice()).to.be.above(0);
  //   expect(await lotteries[0].fees()).to.be.above(0);
  // });

  // it("Should declare a winner in a staking lottery pool", async function () {
  //   await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.STAKING, minAmount);
  //   let numberOfActiveLotteries = await lotteryPoolFactory.numberOfActiveLotteries();
  //   let lotteries = [await _getLotteryPool(0)];
    
  //   await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
  //   await lotteries[0].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
  //   await lotteries[0].connect(addrs[0]).buyTickets(1, {value: ethers.utils.parseEther('0.1')});

  //   await lotteryPoolFactory.connect(addrs[1]).launchStaking(0);
  //   await lotteryPoolFactory.connect(addrs[1]).declareWinner(0);

  //   expect([addr1.address, addr2.address, addrs[0].address]).to.include(await lotteries[0].winner());
  //   expect(await lotteries[0].status()).to.equal(LotteryStatus.CLOSED);
  //   expect(await lotteryPoolFactory.numberOfActiveLotteries()).to.equal(numberOfActiveLotteries - 1);
  // });

  // it("Should transfer NFT to winner", async function () {
  //   // Arrange
  //   await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.DIRECT, minAmount);
  //   let lotteries = [await _getLotteryPool(0)];
  //   expect(await lotteries[0].creator()).to.equal(addrs[1].address);

  //   // Act
  //   await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
  //   await lotteries[0].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
  //   await lotteries[0].connect(addrs[0]).buyTickets(1, {value: ethers.utils.parseEther('0.1')});
  //   await lotteryPoolFactory.connect(addrs[1]).declareWinner(0);

  //   // Assert
  //   const winner = await lotteries[0].winner();
  //   expect(await nft.ownerOf(0)).to.equal(winner);
  // });

  // it("Shouldn't declare a winner if lottery pool is closed", async function () {
  //   // Arrange
  //   await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.DIRECT, minAmount);
  //   let lotteries = [await _getLotteryPool(0)];
    
  //   await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
  //   await lotteries[0].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
  //   await lotteries[0].connect(addrs[0]).buyTickets(1, {value: ethers.utils.parseEther('0.1')});

  //   // Act
  //   await lotteryPoolFactory.connect(addrs[1]).declareWinner(0);

  //   // Assert
  //   await expect(
  //     lotteryPoolFactory.connect(addrs[1]).declareWinner(0)
  //   ).to.be.revertedWith('The lottery pool is already closed');
  // });

  // it("Shouldn't close a lottery if sender isn't the owner", async function () {
  //   // Arrange
  //   await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.DIRECT, minAmount);
  //   let lotteries = [await _getLotteryPool(0)];
    
  //   await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});

  //   // Assert
  //   await expect(
  //     lotteryPoolFactory.connect(addr2).declareWinner(0)
  //   ).to.be.revertedWith('You are not the owner of the lottery');
  // });

  // it("Shouldn't close a lottery if minimum days open hasn't been reached", async function () {
  //   // Arrange
  //   await lotteryPoolFactory.setMinDaysOpen(7);
  //   await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.DIRECT, minAmount);

  //   // Act
  //   await expect(
  //     lotteryPoolFactory.connect(addrs[1]).declareWinner(0)
  //   ).to.be.revertedWith('You must wait the minimum open days');
  // });

  // it("Shouldn't close a staking lottery if is not staking", async function () {
  //   await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.STAKING, minAmount);
  //   let lotteries = [await _getLotteryPool(0)];
  //   await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});

  //   await expect(
  //     lotteryPoolFactory.connect(addrs[1]).declareWinner(0)
  //   ).to.be.revertedWith('The lottery pool is not staking');
  // });

  // it("Should transfer fees when closing the direct lottery pool", async function () {
  //   // Arrange
  //   await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.DIRECT, minAmount);
  //   let lotteries = [await _getLotteryPool(0)];
    
  //   await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
  //   await lotteries[0].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
  //   await lotteries[0].connect(addrs[0]).buyTickets(1, {value: ethers.utils.parseEther('0.1')});

  //   const ownerBalance = await owner.getBalance();
  //   const balance = await lotteries[0].getBalance();
  //   const feePercent = await lotteryPoolFactory.getFeePercent();
  //   const fee = balance * feePercent / 100;

  //   await lotteryPoolFactory.connect(addrs[1]).declareWinner(0);

  //   const expectedOwnerBalance = BigNumber(ownerBalance.toString()).plus(fee);
  //   const currentOwnerBalance = await owner.getBalance();
  //   expect(BigNumber(currentOwnerBalance.toString()).toString()).to.equal(expectedOwnerBalance.toString());
  // });

  // it("Should send payment to creator when closing a direct pool", async function () {
  //   // Arrange
  //   await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.DIRECT, minAmount);
  //   let lotteries = [await _getLotteryPool(0)];
    
  //   await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
  //   await lotteries[0].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
  //   await lotteries[0].connect(addrs[0]).buyTickets(1, {value: ethers.utils.parseEther('0.1')});

  //   // Act
  //   const creatorBalance = await addrs[1].getBalance();
  //   await lotteryPoolFactory.connect(addrs[1]).declareWinner(0);

  //   // Assert
  //   expect(await addrs[1].getBalance()).to.be.above(creatorBalance);
  // });

  // it("Should cancel a lottery", async function () {
  //   // Arrange    
  //   await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.STAKING, ethers.utils.parseEther('10'));
  //   let lotteries = [await _getLotteryPool(0)];

  //   await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
  //   await lotteries[0].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
  //   await lotteries[0].connect(addrs[0]).buyTickets(1, {value: ethers.utils.parseEther('0.1')});

  //   // Act
  //   await expect(
  //     lotteryPoolFactory.connect(addrs[1]).cancelLottery(0)
  //   ).to.emit(lotteryPoolFactory, 'LotteryCancelled');
    
  //   // Assert
  //   expect(await lotteries[0].status()).to.equal(LotteryStatus.CANCELLED);
  // });

  // it("Shouldn't cancel a lottery if minimum amount has been reached", async function () {
  //   // Arrange    
  //   await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.STAKING, ethers.utils.parseEther('0.1'));
  //   let lotteries = [await _getLotteryPool(0)];

  //   await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
  //   await lotteries[0].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
  //   await lotteries[0].connect(addrs[0]).buyTickets(1, {value: ethers.utils.parseEther('0.1')});

  //   // Act
  //   await expect(
  //     lotteryPoolFactory.connect(addrs[1]).cancelLottery(0)
  //   ).to.be.revertedWith('Cannot cancel lottery. The minimum amount has been reached');
  // });

  // it("Should be able to redeem tickets in staking pool", async function() {
  //   // Arrange
  //   await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.STAKING, minAmount);    
  //   let lotteries = [await _getLotteryPool(0)];
    
  //   await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
  //   await lotteries[0].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
  //   await lotteries[0].connect(addrs[0]).buyTickets(1, {value: ethers.utils.parseEther('0.1')});
  //   await lotteryPoolFactory.connect(addrs[1]).launchStaking(0);
  //   await lotteryPoolFactory.connect(addrs[1]).declareWinner(0);

  //   // Act
  //   const balance = await addr1.getBalance();
  //   await lotteries[0].connect(addr1).redeemTickets();

  //   // Assert
  //   expect(await addr1.getBalance()).to.be.above(balance);
  //   expect(await lotteries[0].ticketsOf(addr1.address)).to.equal(0);
  // });

  // it("Shouldn't be able to redeem tickets in direct pool", async function() {
  //   // Arrange
  //   await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.DIRECT, minAmount);    
  //   let lotteries = [await _getLotteryPool(0)];
    
  //   await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
  //   await lotteries[0].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
  //   await lotteries[0].connect(addrs[0]).buyTickets(1, {value: ethers.utils.parseEther('0.1')});
    
  //   // Act
  //   await lotteryPoolFactory.connect(addrs[1]).declareWinner(0);

  //   // Assert
  //   await expect (
  //     lotteries[0].connect(addr1).redeemTickets()
  //   ).to.be.revertedWith('Tickets can only be redeemed in staking lottery pools');
  // });

  // it("Should be able to update fee percent", async function () {  
  //   // Arrange
  //   expect(await lotteryPoolFactory.getFeePercent()).to.equal(10);

  //   // Act
  //   await expect(
  //       await lotteryPoolFactory.connect(owner).setFeePercent(20)
  //   ).to.emit(lotteryPoolFactory, 'FeePercentChanged');

  //   // Assert
  //   expect(await lotteryPoolFactory.getFeePercent()).to.equal(20);
  // });

  // it("Shouldn't update fee percent when sender isn't the owner", async function () {   
  //   await expect(
  //     lotteryPoolFactory.connect(addr1).setFeePercent(20)
  //   ).to.be.reverted;
  // });

  // it("Should be able to update the wallet address", async function () {   
  //   expect(await lotteryPoolFactory.getWallet()).to.equal(owner.address);
  //   await expect(
  //     lotteryPoolFactory.connect(owner).setWallet(addrs[3].address)
  //   ).to.emit(lotteryPoolFactory, 'WalletChanged');
  //   expect(await lotteryPoolFactory.getWallet()).to.equal(addrs[3].address);
  // });

  // it("Shouldn't be able to update the wallet address if not the owner", async function () {   
  //     await expect(
  //       lotteryPoolFactory.connect(addr2).setWallet(addrs[3].address)
  //     ).to.be.reverted;
  // });

  // it("Should be able to update the minimum days open", async function () {
  //   await expect(
  //     lotteryPoolFactory.connect(owner).setMinDaysOpen(2)
  //   ).to.emit(lotteryPoolFactory, 'MinDaysOpenChanged');
  //   expect(await lotteryPoolFactory.getMinDaysOpen()).to.equal(2);
  // });

  // it("Shouldn't be able to update the minimum days open if not the owner", async function () {   
  //     await expect(
  //       lotteryPoolFactory.connect(addr2).setMinDaysOpen(3)
  //     ).to.be.reverted;
  // });

  // it("Should deposit balance to stake it", async function() {
  //   // Arrange
  //   await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.STAKING, minAmount);
  //   let lotteries = [await _getLotteryPool(0)];

  //   // Act
  //   await lotteries[0].connect(addr1).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
  //   await lotteries[0].connect(addr2).buyTickets(1, {value: ethers.utils.parseEther('0.1')});
  //   expect(await lotteries[0].getBalance()).to.equal(ethers.utils.parseEther('0.3'));

  //   await lotteryPoolFactory.connect(addrs[1]).launchStaking(0);
    
  //   // Assert
  //   expect(await lotteries[0].getBalance()).to.equal(0);

  //   const stakingBalance = await lotteries[0].getStakingBalance();
  //   expect(stakingBalance).to.be.equal(ethers.utils.parseEther('0.3'));
  // });

  it("Should withdraw balance when closing an staking lottery", async function() {
    // Arrange
    await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.STAKING, minAmount);
    let lotteries = [await _getLotteryPool(0)];

    // Act
    await lotteries[0].connect(addr1).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
    await lotteries[0].connect(addr2).buyTickets(1, {value: ethers.utils.parseEther('0.1')});
    await lotteryPoolFactory.connect(addrs[1]).launchStaking(0);
    // done();

    /*********************************/

    let stakingBalance = await lotteries[0].getStakingBalance();
    console.log("Staking Balance = ", stakingBalance.toString());

    allowance = await lotteries[0].getStakingAllowance();
    console.log("Staking Allowance = ", allowance.toString());

    const gateway = await lotteries[0].kk();
    console.log("Gateway = ", gateway);    

    /*********************************/


    // await lotteryPoolFactory.connect(addrs[1]).declareWinner(0);

    // /*********************************/
    
    let finalPrice = await lotteries[0].getFinalPrice();
    console.log("Final Price = ", finalPrice.toString());

    // /*********************************/
    
    // // Assert
    // expect(await lotteries[0].getBalance()).to.be.above(ethers.utils.parseEther('0.3'));    
  }).timeout(100000);

  // it("Aave test", async function() {
  //   // const pool = await aaveAdapter.getProvider();    
  //   // console.log(pool);

  //   // console.log(owner.address);
  //   const balance = await owner.getBalance();
  //   console.log("Owner Balance = ", balance.toString());

  //   // await aaveAdapter.deposit(
  //   //   pool, 
  //   //   "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", 
  //   //   owner.address, 
  //   //   ethers.utils.parseEther('0.1')
  //   //   , {value: ethers.utils.parseEther('1')}
  //   //   );
  //   console.log("----------DEPOSIT----------");
  //   await aaveAdapter.depositETH({value: ethers.utils.parseEther('10')});

  //   // const weth = await aaveAdapter.getWETHAddress();
  //   // console.log("WETH = ", weth);

  //   const pool = await aaveAdapter.getProvider();
  //   console.log("LendingPool = ", pool);

  //   const b = await aaveAdapter.getBalance();
  //   console.log("AaveAdapter Balance = ", b.toString());

  //   const balance2 = await owner.getBalance();
  //   console.log("Owner Balance = ", balance2.toString());
    
  //   [totalCollateralETH,
  //     totalDebtETH,
  //     availableBorrowsETH,
  //     currentLiquidationThreshold,
  //     ltv,
  //     healthFactor] = await aaveAdapter.getUserAccountData();
  //   console.log("totalCollateralETH = ", totalCollateralETH.toString());

  //   console.log("----------aWETH----------");
    
  //   const awethBalance = await aaveAdapter.getAWETHBalance();
  //   console.log("aWETH = ", awethBalance.toString());

  //   console.log("----------WITHDRAW----------");
  //   // //Ensure you set the relevant ERC20 allowance of aWETH, before calling this function, so the WETHGateway contract can burn the associated aWETH.
  //   await aaveAdapter.withdrawETH(ethers.utils.parseEther('0.01'));

    
  //   const all = await aaveAdapter.getAllowance();
  //   console.log("aWETH Allowance = ", all.toString());
  //   const kk = await aaveAdapter.kk();
  //   console.log("Gateway = ", kk);
    
    
  //   const b3 = await owner.getBalance();
  //   console.log("Owner Balance = ", b3.toString());

  //   const baa = await aaveAdapter.getBalance();
  //   console.log("AaveAdapter Balance = ", baa.toString());

  //   [totalCollateralETH,
  //     totalDebtETH,
  //     availableBorrowsETH,
  //     currentLiquidationThreshold,
  //     ltv,
  //     healthFactor] = await aaveAdapter.getUserAccountData();
  //   console.log("totalCollateralETH = ", totalCollateralETH.toString());


  //   expect(1).to.equal(1);
  // });

  async function _getLotteryPool(index) {
    let lottery = await lotteryPoolFactory.lotteries(index);
    LotteryPool = await ethers.getContractFactory("LotteryPool");
    return await LotteryPool.attach(lottery);    
  }

});