// const { ethers, upgrades } = require("hardhat");
// const { use, expect, assert } = require("chai");
// const { solidity } = require("ethereum-waffle");

// var BigNumber = require('big-number');

// use(solidity);

// const LotteryPoolType = {
// 	DIRECT: 0,
// 	STAKING: 1
// }

// const LotteryStatus = { 
//     OPEN: 0,
//     STAKING: 1,
//     CLOSED: 2,
//     CANCELLED: 3
// }

// describe("LotteryPoolFactory", function () {
//   let LotteryPoolFactory, LotteryPool, EchionNFT, LotteryPoolStaking;
//   let lotteryPoolFactory, nft, lotteryPoolStaking;
//   let ticketPrice, minAmount;
//   let imageURI;
//   let metadataURI;
//   let owner;
//   let addr1;
//   let addr2;
//   let addrs;
//   let timeout = 3000000;
//   ticketPrice = ethers.utils.parseEther('0.1');
//   minAmount = ethers.utils.parseEther('0.1');
//   imageURI = "https://ipfs.io/ipfs/QmWNcYhEcggdm1TFt2m6WmGqqQwfFXudr5eFzKPtm1nYwq";
//   metadataURI = "https://ipfs.io/ipfs/QmUCxDBKCrx2JXV4ZNYLwhUPXqTvRAu6Zceoh1FNVumoec";

//   beforeEach(async function () {
    
//     // Deploying contracts
//     EchionNFT = await ethers.getContractFactory("EchionNFT");
//     nft = await EchionNFT.deploy();
//     expect(nft.address).to.properAddress;

//     LotteryPoolStaking = await ethers.getContractFactory("LotteryPoolStaking");
//     lotteryPoolStaking = await LotteryPoolStaking.deploy(
//       "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5", // _lendingPoolAddressesProvider
//       "0xcc9a0B7c43DC2a5F023Bb9b738E45B0Ef6B06E04",  // _wethGateway
//       "0x030bA81f1c18d280636F32af80b9AAd02Cf0854e"); // _aWethAddress
//     expect(lotteryPoolStaking.address).to.properAddress;

//     LotteryPoolFactory = await ethers.getContractFactory("LotteryPoolFactory");
//     lotteryPoolFactory = await LotteryPoolFactory.deploy(lotteryPoolStaking.address);
//     expect(lotteryPoolFactory.address).to.properAddress;

//     await lotteryPoolFactory.setMinDaysOpen(0);    

//     // Getting test accounts
//     [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

//     // NFT approvals
//     await nft.connect(addrs[1]).mint(imageURI, metadataURI);
//     await nft.connect(addrs[1]).setApprovalForAll(lotteryPoolFactory.address, true);
//     expect(await nft.ownerOf(0)).to.equal(addrs[1].address);

//     await nft.connect(addrs[2]).mint(imageURI, metadataURI);
//     await nft.connect(addrs[2]).setApprovalForAll(lotteryPoolFactory.address, true);
//     expect(await nft.ownerOf(1)).to.equal(addrs[2].address);
//   });

//   it("Should create a new lottery", async function () {
//     // Act
//     await expect(
//       lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.DIRECT, minAmount)
//     ).to.emit(lotteryPoolFactory, 'LotteryCreated');

//     await expect(
//       lotteryPoolFactory.connect(addrs[2]).createLottery(nft.address, 1, ticketPrice, LotteryPoolType.DIRECT, minAmount)
//     ).to.emit(lotteryPoolFactory, 'LotteryCreated');

//     let lotteries = [await _getLotteryPool(0), await _getLotteryPool(1)];

//     // Assert
//     expect(await lotteryPoolFactory.numberOfActiveLotteries()).to.equal(2);
//     expect(await lotteries[0].status()).to.equal(LotteryStatus.OPEN);
//     expect(await lotteries[0].creator()).to.equal(addrs[1].address);
//     expect(await lotteries[1].creator()).to.equal(addrs[2].address);
//   }).timeout(timeout);

//   it("Should buy lottery tickets", async function () {
//     // Arrange
//     await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.DIRECT, minAmount);        
//     let lotteries = [await _getLotteryPool(0)];

//     // Act
//     await expect(
//       lotteries[0].connect(addr1).buyTickets(2, {value: ethers.utils.parseEther('0.2')})
//     ).to.emit(lotteries[0], 'TicketsBought');
//     await lotteries[0].connect(addr2).buyTickets(1, {value: ethers.utils.parseEther('0.1')});
    
//     // Assert
//     expect(await lotteries[0].numberOfTickets()).to.equal(3);
//     expect(await lotteries[0].ticketsOf(addr1.address)).to.equal(2)
//     expect(await lotteries[0].ticketsOf(addr2.address)).to.equal(1)
//     expect(await lotteries[0].getBalance()).to.equal(ethers.utils.parseEther('0.3'));
//   }).timeout(timeout);

//   it("Shouldn't buy a ticket if the lottery is not open", async function () {
//     // Arrange
//     await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.STAKING, minAmount);
//     let lotteries = [await _getLotteryPool(0)];
    
//     // Act
//     await lotteries[0].connect(addr1).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
//     await lotteryPoolFactory.connect(addrs[1]).launchStaking(0);

//     // Assert
//     await expect(
//       lotteries[0].connect(addr1).buyTickets(1, {value: ethers.utils.parseEther('0.1')})
//     ).to.be.revertedWith('The lottery pool is not open');
//   }).timeout(timeout);

//   it("Should update total balance when buying tickets", async function () {
//     // Arrange
//     await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.DIRECT, minAmount);
//     await lotteryPoolFactory.connect(addrs[2]).createLottery(nft.address, 1, ticketPrice, LotteryPoolType.DIRECT, minAmount);
//     let lotteries = [await _getLotteryPool(0), await _getLotteryPool(1)];

//     // Act
//     await lotteries[0].connect(addr1).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
//     await lotteries[0].connect(addr2).buyTickets(1, {value: ethers.utils.parseEther('0.1')});
//     await lotteries[1].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
//     await lotteries[1].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
    
//     // Assert
//     expect(await lotteryPoolFactory.totalBalance()).to.equal(ethers.utils.parseEther('0.8'));
//   }).timeout(timeout);

//   it("Should cancel tickets", async function () {
//     // Arrange
//     await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.DIRECT, minAmount);
//     let lotteries = [await _getLotteryPool(0)];

//     // Act
//     await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
//     await lotteries[0].connect(addr2).buyTickets(1, {value: ethers.utils.parseEther('0.1')});
//     await expect(
//       lotteries[0].connect(addr1).cancelTickets(2)
//     ).to.emit(lotteries[0], 'TicketsCancelled');
    
//     // Assert
//     expect(await lotteries[0].numberOfTickets()).to.equal(2);
//     expect(await lotteries[0].ticketsOf(addr1.address)).to.equal(1)
//     expect(await lotteries[0].getBalance()).to.equal(ethers.utils.parseEther('0.2'));
//   }).timeout(timeout);

//   it("Shouldn't cancel more tickets than tickets bought", async function () {
//     // Arrange
//     await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.STAKING, minAmount);
//     let lotteries = [await _getLotteryPool(0)];
//     await lotteries[0].connect(addr1).buyTickets(2, {value: ethers.utils.parseEther('0.2')})

//     // Assert
//     await expect(
//       lotteries[0].connect(addr1).cancelTickets(3)
//     ).to.be.revertedWith('You do not have enough tickets');
//   }).timeout(timeout);

//   it("Shouldn't cancel tickets if the lottery is not open", async function () {
//     // Arrange
//     await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.STAKING, minAmount);
//     let lotteries = [await _getLotteryPool(0)];
//     await lotteries[0].connect(addr1).buyTickets(2, {value: ethers.utils.parseEther('0.2')})
    
//     // Act
//     await lotteryPoolFactory.connect(addrs[1]).launchStaking(0);

//     // Assert
//     await expect(
//       lotteries[0].connect(addr1).cancelTickets(2)
//     ).to.be.revertedWith('The lottery pool is not open');
//   }).timeout(timeout);

//   it("Should update total balance when cancelling tickets", async function () {
//     // Arrange
//     await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.DIRECT, minAmount);
//     await lotteryPoolFactory.connect(addrs[2]).createLottery(nft.address, 1, ticketPrice, LotteryPoolType.DIRECT, minAmount);
//     let lotteries = [await _getLotteryPool(0), await _getLotteryPool(1)];

//     // Act
//     await lotteries[0].connect(addr1).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
//     await lotteries[0].connect(addr2).buyTickets(1, {value: ethers.utils.parseEther('0.1')});
//     await lotteries[1].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
//     await lotteries[1].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
//     await lotteries[0].connect(addr1).cancelTickets(1);
//     await lotteries[1].connect(addr2).cancelTickets(1);
    
//     // Assert
//     expect(await lotteryPoolFactory.totalBalance()).to.equal(ethers.utils.parseEther('0.6'));
//   }).timeout(timeout);

//   it("Should stake a lottery", async function () {
//     // Arrange
//     await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.STAKING, minAmount);
//     let lotteries = [await _getLotteryPool(0)];
//     await lotteries[0].connect(addr1).buyTickets(2, {value: ethers.utils.parseEther('0.2')});

//     // Act
//     await expect(
//       lotteryPoolFactory.connect(addrs[1]).launchStaking(0)
//     ).to.emit(lotteryPoolFactory, 'LotteryStaked');
    
//     // Assert
//     expect(await lotteries[0].status()).to.equal(LotteryStatus.STAKING);
//   }).timeout(timeout);

//   it("Shouldn't stake a lottery if sender isn't the owner", async function () {
//     // Arrange
//     await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.STAKING, minAmount);

//     // Act
//     await expect(
//       lotteryPoolFactory.connect(addr2).launchStaking(0)
//     ).to.be.revertedWith('You are not the owner of the lottery');
//   }).timeout(timeout);

//   it("Shouldn't stake a lottery if minimum days open hasn't been reached", async function () {
//     // Arrange
//     await lotteryPoolFactory.setMinDaysOpen(7);
//     await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.STAKING, minAmount);
//     let lotteries = [await _getLotteryPool(0)];
//     await lotteries[0].connect(addr1).buyTickets(2, {value: ethers.utils.parseEther('0.2')});

//     // Act
//     await expect(
//       lotteryPoolFactory.connect(addrs[1]).launchStaking(0)
//     ).to.be.revertedWith('You must wait the minimum open days');
//   }).timeout(timeout);

//   it("Shouldn't stake a lottery if pool type isn't compatible", async function () {
//     // Arrange
//     await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.DIRECT, minAmount);

//     // Act
//     await expect(
//       lotteryPoolFactory.connect(addrs[1]).launchStaking(0)
//     ).to.be.revertedWith('Lottery pool type is not compatible with staking');
//   }).timeout(timeout);

//   it("Should declare a winner in a direct lottery pool", async function () {
//     await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.DIRECT, minAmount);
//     let numberOfActiveLotteries = await lotteryPoolFactory.numberOfActiveLotteries();
//     let lotteries = [await _getLotteryPool(0)];
    
//     await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
//     await lotteries[0].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
//     await lotteries[0].connect(addrs[0]).buyTickets(1, {value: ethers.utils.parseEther('0.1')});

//     await lotteryPoolFactory.connect(addrs[1]).declareWinner(0);

//     expect([addr1.address, addr2.address, addrs[0].address]).to.include(await lotteries[0].winner());
//     expect(await lotteries[0].status()).to.equal(LotteryStatus.CLOSED);
//     expect(await lotteryPoolFactory.numberOfActiveLotteries()).to.equal(numberOfActiveLotteries - 1);
//     expect(await lotteries[0].getPaymentToCreator()).to.be.above(0);
//     expect(await lotteries[0].fees()).to.be.above(0);
//   }).timeout(timeout);

//   it("Should declare a winner in a staking lottery pool", async function () {
//     await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.STAKING, minAmount);
//     let numberOfActiveLotteries = await lotteryPoolFactory.numberOfActiveLotteries();
//     let lotteries = [await _getLotteryPool(0)];
    
//     await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
//     await lotteries[0].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
//     await lotteries[0].connect(addrs[0]).buyTickets(1, {value: ethers.utils.parseEther('0.1')});

//     await lotteryPoolFactory.connect(addrs[1]).launchStaking(0);
//     await lotteryPoolFactory.connect(addrs[1]).declareWinner(0);

//     expect([addr1.address, addr2.address, addrs[0].address]).to.include(await lotteries[0].winner());
//     expect(await lotteries[0].status()).to.equal(LotteryStatus.CLOSED);
//     expect(await lotteryPoolFactory.numberOfActiveLotteries()).to.equal(numberOfActiveLotteries - 1);
//   }).timeout(timeout);

//   it("Should transfer NFT to winner", async function () {
//     // Arrange
//     await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.DIRECT, minAmount);
//     let lotteries = [await _getLotteryPool(0)];
//     expect(await lotteries[0].creator()).to.equal(addrs[1].address);

//     // Act
//     await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
//     await lotteries[0].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
//     await lotteries[0].connect(addrs[0]).buyTickets(1, {value: ethers.utils.parseEther('0.1')});
//     await lotteryPoolFactory.connect(addrs[1]).declareWinner(0);

//     // Assert
//     const winner = await lotteries[0].winner();
//     expect(await nft.ownerOf(0)).to.equal(winner);
//   }).timeout(timeout);

//   it("Shouldn't declare a winner if lottery pool is closed", async function () {
//     // Arrange
//     await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.DIRECT, minAmount);
//     let lotteries = [await _getLotteryPool(0)];
    
//     await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
//     await lotteries[0].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
//     await lotteries[0].connect(addrs[0]).buyTickets(1, {value: ethers.utils.parseEther('0.1')});

//     // Act
//     await lotteryPoolFactory.connect(addrs[1]).declareWinner(0);

//     // Assert
//     await expect(
//       lotteryPoolFactory.connect(addrs[1]).declareWinner(0)
//     ).to.be.revertedWith('The lottery pool is already closed');
//   }).timeout(timeout);

//   it("Shouldn't close a lottery if sender isn't the owner", async function () {
//     // Arrange
//     await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.DIRECT, minAmount);
//     let lotteries = [await _getLotteryPool(0)];
    
//     await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});

//     // Assert
//     await expect(
//       lotteryPoolFactory.connect(addr2).declareWinner(0)
//     ).to.be.revertedWith('You are not the owner of the lottery');
//   }).timeout(timeout);

//   it("Shouldn't close a lottery if minimum days open hasn't been reached", async function () {
//     // Arrange
//     await lotteryPoolFactory.setMinDaysOpen(7);
//     await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.DIRECT, minAmount);

//     // Act
//     await expect(
//       lotteryPoolFactory.connect(addrs[1]).declareWinner(0)
//     ).to.be.revertedWith('You must wait the minimum open days');
//   }).timeout(timeout);

//   it("Shouldn't close a staking lottery if is not staking", async function () {
//     await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.STAKING, minAmount);
//     let lotteries = [await _getLotteryPool(0)];
//     await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});

//     await expect(
//       lotteryPoolFactory.connect(addrs[1]).declareWinner(0)
//     ).to.be.revertedWith('The lottery pool is not staking');
//   }).timeout(timeout);

//   it("Should transfer fees when closing the direct lottery pool", async function () {
//     // Arrange
//     await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.DIRECT, minAmount);
//     let lotteries = [await _getLotteryPool(0)];
    
//     await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
//     await lotteries[0].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
//     await lotteries[0].connect(addrs[0]).buyTickets(1, {value: ethers.utils.parseEther('0.1')});

//     const ownerBalance = await owner.getBalance();
//     const balance = await lotteries[0].getBalance();
//     const feePercent = await lotteryPoolFactory.getFeePercent();
//     const fee = balance * feePercent / 100;

//     await lotteryPoolFactory.connect(addrs[1]).declareWinner(0);

//     const expectedOwnerBalance = BigNumber(ownerBalance.toString()).plus(fee);
//     const currentOwnerBalance = await owner.getBalance();
//     expect(BigNumber(currentOwnerBalance.toString()).toString()).to.equal(expectedOwnerBalance.toString());
//   }).timeout(timeout);

//   it("Should not send payment to creator when closing a direct pool", async function () {
//     // Arrange
//     await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.DIRECT, minAmount);
//     let lotteries = [await _getLotteryPool(0)];
    
//     await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
//     await lotteries[0].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
//     await lotteries[0].connect(addrs[0]).buyTickets(1, {value: ethers.utils.parseEther('0.1')});

//     // Act
//     const creatorBalance = await addrs[1].getBalance();
//     await lotteryPoolFactory.connect(addrs[1]).declareWinner(0);

//     // Assert
//     expect(await addrs[1].getBalance()).to.be.below(creatorBalance);
//   }).timeout(timeout);

//   // it("Should redeem payment to creator", async function () {
//   //   // Arrange
//   //   await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.DIRECT, minAmount);
//   //   let lotteries = [await _getLotteryPool(0)];
    
//   //   await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
//   //   await lotteries[0].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
//   //   await lotteries[0].connect(addrs[0]).buyTickets(1, {value: ethers.utils.parseEther('0.1')});

//   //   // Act
//   //   await lotteryPoolFactory.connect(addrs[1]).declareWinner(0);
    
//   //   const creatorBalance = await addrs[1].getBalance();
//   //   await lotteries[0].connect(addrs[1]).redeemCreatorPayment();

//   //   // Assert
//   //   expect(await addrs[1].getBalance()).to.be.above(creatorBalance);
//   // }).timeout(timeout);

//   it("Should cancel a lottery", async function () {
//     // Arrange    
//     await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.STAKING, ethers.utils.parseEther('10'));
//     let lotteries = [await _getLotteryPool(0)];

//     await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
//     await lotteries[0].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
//     await lotteries[0].connect(addrs[0]).buyTickets(1, {value: ethers.utils.parseEther('0.1')});

//     // Act
//     await expect(
//       lotteryPoolFactory.connect(addrs[1]).cancelLottery(0)
//     ).to.emit(lotteryPoolFactory, 'LotteryCancelled');
    
//     // Assert
//     expect(await lotteries[0].status()).to.equal(LotteryStatus.CANCELLED);
//   }).timeout(timeout);

//   it("Shouldn't cancel a lottery if minimum amount has been reached", async function () {
//     // Arrange    
//     await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.STAKING, ethers.utils.parseEther('0.1'));
//     let lotteries = [await _getLotteryPool(0)];

//     await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
//     await lotteries[0].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
//     await lotteries[0].connect(addrs[0]).buyTickets(1, {value: ethers.utils.parseEther('0.1')});

//     // Act
//     await expect(
//       lotteryPoolFactory.connect(addrs[1]).cancelLottery(0)
//     ).to.be.revertedWith('Cannot cancel lottery. The minimum amount has been reached');
//   }).timeout(timeout);

//   it("Should be able to redeem tickets in staking pool", async function() {
//     // Arrange
//     await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.STAKING, minAmount);    
//     let lotteries = [await _getLotteryPool(0)];
    
//     await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
//     await lotteries[0].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
//     await lotteries[0].connect(addrs[0]).buyTickets(1, {value: ethers.utils.parseEther('0.1')});
//     await lotteryPoolFactory.connect(addrs[1]).launchStaking(0);
//     await lotteryPoolFactory.connect(addrs[1]).declareWinner(0);

//     // Act
//     const balance = await addr1.getBalance();
//     await lotteries[0].connect(addr1).redeemTickets();

//     // Assert
//     expect(await addr1.getBalance()).to.be.above(balance);
//     expect(await lotteries[0].ticketsOf(addr1.address)).to.equal(0);
//   }).timeout(timeout);

//   it("Shouldn't be able to redeem tickets in direct pool", async function() {
//     // Arrange
//     await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.DIRECT, minAmount);    
//     let lotteries = [await _getLotteryPool(0)];
    
//     await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
//     await lotteries[0].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
//     await lotteries[0].connect(addrs[0]).buyTickets(1, {value: ethers.utils.parseEther('0.1')});
    
//     // Act
//     await lotteryPoolFactory.connect(addrs[1]).declareWinner(0);

//     // Assert
//     await expect (
//       lotteries[0].connect(addr1).redeemTickets()
//     ).to.be.revertedWith('Tickets can only be redeemed in staking lottery pools');
//   }).timeout(timeout);

//   it("Should be able to update fee percent", async function () {  
//     // Arrange
//     expect(await lotteryPoolFactory.getFeePercent()).to.equal(10);

//     // Act
//     await expect(
//         await lotteryPoolFactory.connect(owner).setFeePercent(20)
//     ).to.emit(lotteryPoolFactory, 'FeePercentChanged');

//     // Assert
//     expect(await lotteryPoolFactory.getFeePercent()).to.equal(20);
//   }).timeout(timeout);

//   it("Shouldn't update fee percent when sender isn't the owner", async function () {   
//     await expect(
//       lotteryPoolFactory.connect(addr1).setFeePercent(20)
//     ).to.be.reverted;
//   }).timeout(timeout);

//   it("Should be able to update the wallet address", async function () {   
//     expect(await lotteryPoolFactory.getWallet()).to.equal(owner.address);
//     await expect(
//       lotteryPoolFactory.connect(owner).setWallet(addrs[3].address)
//     ).to.emit(lotteryPoolFactory, 'WalletChanged');
//     expect(await lotteryPoolFactory.getWallet()).to.equal(addrs[3].address);
//   }).timeout(timeout);

//   it("Shouldn't be able to update the wallet address if not the owner", async function () {   
//       await expect(
//         lotteryPoolFactory.connect(addr2).setWallet(addrs[3].address)
//       ).to.be.reverted;
//   }).timeout(timeout);

//   it("Should be able to update the minimum days open", async function () {
//     await expect(
//       lotteryPoolFactory.connect(owner).setMinDaysOpen(2)
//     ).to.emit(lotteryPoolFactory, 'MinDaysOpenChanged');
//     expect(await lotteryPoolFactory.getMinDaysOpen()).to.equal(2);
//   }).timeout(timeout);

//   it("Shouldn't be able to update the minimum days open if not the owner", async function () {   
//       await expect(
//         lotteryPoolFactory.connect(addr2).setMinDaysOpen(3)
//       ).to.be.reverted;
//   }).timeout(timeout);

//   it("Should deposit balance to stake it", async function() {
//     // Arrange
//     await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.STAKING, minAmount);
//     let lotteries = [await _getLotteryPool(0)];

//     // Act
//     await lotteries[0].connect(addr1).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
//     await lotteries[0].connect(addr2).buyTickets(1, {value: ethers.utils.parseEther('0.1')});
//     expect(await lotteries[0].getBalance()).to.equal(ethers.utils.parseEther('0.3'));

//     await lotteryPoolFactory.connect(addrs[1]).launchStaking(0);
    
//     // Assert
//     expect(await lotteries[0].getBalance()).to.equal(0);

//     const stakingBalance = await lotteries[0].getStakingBalance();
//     expect(stakingBalance).to.be.equal(ethers.utils.parseEther('0.3'));
//   }).timeout(timeout);

//   it("Should withdraw balance when closing an staking lottery", async function() {
//     // Arrange
//     await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.STAKING, minAmount);
//     let lotteries = [await _getLotteryPool(0)];

//     // Act
//     await lotteries[0].connect(addr1).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
//     await lotteries[0].connect(addr2).buyTickets(1, {value: ethers.utils.parseEther('0.1')});

//     let balance = await lotteries[0].getBalance();
//     await lotteryPoolFactory.connect(addrs[1]).launchStaking(0);

//     let stakingBalance = await lotteries[0].getStakingBalance();
//     expect(stakingBalance).to.be.at.least(balance);

//     await lotteryPoolFactory.connect(addrs[1]).declareWinner(0);

//     // Assert
//     let allowance = await lotteries[0].getStakingAllowance();
//     expect(allowance).to.be.above(0);

//     stakingBalance = await lotteries[0].getStakingBalance();
//     expect(stakingBalance).to.equal(0);

//     let paymentToCreator = await lotteries[0].getPaymentToCreator();
//     expect(paymentToCreator).to.be.above(0);

//     let fees = await lotteries[0].fees();
//     expect(fees).to.be.above(0);

//   }).timeout(timeout);

//   it("Should withdraw balance when cancelling an staking lottery", async function() {
//     // Arrange
//     await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, LotteryPoolType.STAKING, minAmount);
//     let lotteries = [await _getLotteryPool(0)];

//     // Act
//     await lotteries[0].connect(addr1).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
//     await lotteries[0].connect(addr2).buyTickets(1, {value: ethers.utils.parseEther('0.1')});

//     let balance = await lotteries[0].getBalance();
//     await lotteryPoolFactory.connect(addrs[1]).launchStaking(0);

//     let stakingBalance = await lotteries[0].getStakingBalance();
//     expect(stakingBalance).to.be.at.least(balance);

//     await lotteryPoolFactory.connect(addrs[1]).cancelLottery(0);

//     // Assert
//     let allowance = await lotteries[0].getStakingAllowance();
//     expect(allowance).to.be.above(0);

//     stakingBalance = await lotteries[0].getStakingBalance();
//     expect(stakingBalance).to.equal(0);

//     let paymentToCreator = await lotteries[0].getPaymentToCreator();
//     expect(paymentToCreator).to.equal(0);

//     let fees = await lotteries[0].fees();
//     expect(fees).to.be.above(0);

//   }).timeout(timeout);

//   async function _getLotteryPool(index) {
//     let lottery = await lotteryPoolFactory.lotteries(index);
//     LotteryPool = await ethers.getContractFactory("LotteryPool");
//     return await LotteryPool.attach(lottery);    
//   }

// });