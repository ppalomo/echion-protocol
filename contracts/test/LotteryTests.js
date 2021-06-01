const { ethers, upgrades } = require("hardhat");
const { use, expect, assert } = require("chai");
const { solidity } = require("ethereum-waffle");

// var BigNumber = require('big-number');
use(solidity);

describe("NFT Lottery Tests", function () {
  let LotteryFactory, Lottery;
  let lotteryFactory, lottery;
  let owner;
  let addr1;
  let addr2;
  let addrs;
  let nfts = [
    {
      ticketPrice: ethers.utils.parseEther('0.1'),
      address: "0xE1A19Eb074815e4028768182F8971D222416159A",
      index: 0
    },
    { 
      ticketPrice: ethers.utils.parseEther('0.1'),
      address: "0x88b0256bf2af5495853bea5fd6ed4b29f23b1a41",
      index: 5
    },
    {
      ticketPrice: ethers.utils.parseEther('0.1'),
      address: "0x6f86a5f81cb7428fabddfc545b1967e51da7a201",
      index: 0
    }
  ]

  beforeEach(async function () {
    
    // Deploying contract
    LotteryFactory = await ethers.getContractFactory("LotteryFactory");
    lotteryFactory = await LotteryFactory.deploy();
    expect(lotteryFactory.address).to.properAddress;

    // Getting test accounts
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
  });

  it("Should create a new lottery", async function () {
    // Act
    await expect(
      lotteryFactory.createLottery(nfts[0].address, nfts[0].index, nfts[0].ticketPrice)
    ).to.emit(lotteryFactory, 'LotteryCreated');
    await lotteryFactory.createLottery(nfts[1].address, nfts[1].index, nfts[1].ticketPrice);
    
    // Assert
    expect(await lotteryFactory.numberOfActiveLotteries()).to.equal(2);
  });

  it("Should buy lottery tickets", async function () {
    // Arrange
    await lotteryFactory.createLottery(nfts[0].address, nfts[0].index, nfts[0].ticketPrice);        
    lottery = await getLottery(0);

    // Act
    await expect(
      lottery.connect(addr1).buyTickets(2, {value: ethers.utils.parseEther('0.2')})
    ).to.emit(lottery, 'TicketsBought');
    await lottery.connect(addr2).buyTickets(1, {value: ethers.utils.parseEther('0.1')});
    
    // Assert
    expect(await lottery.numberOfTickets()).to.equal(3);
    expect(await lottery.getAddressTickets(addr1.address)).to.equal(2)
    expect(await lottery.getAddressTickets(addr2.address)).to.equal(1)
    expect(await lottery.getBalance()).to.equal(ethers.utils.parseEther('0.3'));
  });

  it("Should update total balance when buying tickets", async function () {
    // Arrange
    await lotteryFactory.createLottery(nfts[0].address, nfts[0].index, nfts[0].ticketPrice);
    await lotteryFactory.createLottery(nfts[1].address, nfts[1].index, nfts[1].ticketPrice);
    lottery = await getLottery(0);
    let lottery2 = await getLottery(1);

    // Act
    await lottery.connect(addr1).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
    await lottery.connect(addr2).buyTickets(1, {value: ethers.utils.parseEther('0.1')});
    await lottery2.connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
    await lottery2.connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
    
    // Assert
    expect(await lotteryFactory.totalBalance()).to.equal(ethers.utils.parseEther('0.8'));
  });

  it("Should cancel tickets", async function () {
    // Arrange
    await lotteryFactory.createLottery(nfts[0].address, nfts[0].index, nfts[0].ticketPrice);    
    lottery = await getLottery(0);

    // Act
    await lottery.connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
    await lottery.connect(addr2).buyTickets(1, {value: ethers.utils.parseEther('0.1')});
    await expect(
      lottery.connect(addr1).cancelTickets(2)
    ).to.emit(lottery, 'TicketsCancelled');
    
    // Assert
    expect(await lottery.numberOfTickets()).to.equal(2);
    expect(await lottery.getAddressTickets(addr1.address)).to.equal(1)
    expect(await lottery.getBalance()).to.equal(ethers.utils.parseEther('0.2'));
  });

  it("Should update total balance when cancelling tickets", async function () {
    // Arrange
    await lotteryFactory.createLottery(nfts[0].address, nfts[0].index, nfts[0].ticketPrice);
    await lotteryFactory.createLottery(nfts[1].address, nfts[1].index, nfts[1].ticketPrice);
    lottery = await getLottery(0);
    let lottery2 = await getLottery(1);

    // Act
    await lottery.connect(addr1).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
    await lottery.connect(addr2).buyTickets(1, {value: ethers.utils.parseEther('0.1')});
    await lottery2.connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
    await lottery2.connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
    await lottery.connect(addr1).cancelTickets(1);
    await lottery2.connect(addr2).cancelTickets(1);
    
    // Assert
    expect(await lotteryFactory.totalBalance()).to.equal(ethers.utils.parseEther('0.6'));
  });

  // it("Should close a lottery", async function () {
  //   await lotteryFactory.createLottery(nfts[0].address, nfts[0].index, nfts[0].ticketPrice);    
  //   lottery = await getLottery(0);

  //   expect(await lottery.state()).to.equal(0);

  //   await lotteryFactory.launchStaking(0);

  //   expect(await lottery.state()).to.equal(1);
  // });



  // it("Shouldn't buy a ticket if the lottery is not open", async function () {
  //   await lotteryFactory.createLottery(nfts[0].address, nfts[0].index, nfts[0].ticketPrice);
  //   await lotteryFactory.launchStaking(0);

  //   lottery = await getLottery(0);

  //   await expect(
  //     lottery.connect(addr1).buyTickets(1, {value: ethers.utils.parseEther('0.1')})
  //   ).to.be.revertedWith('The lottery open period was closed');
  // });

  // it("Should declare a winner", async function () {
  //   await lotteryFactory.createLottery(nfts[0].address, nfts[0].index, nfts[0].ticketPrice);
  //   let numberOfActiveLotteries = await lotteryFactory.numberOfActiveLotteries();
  //   lottery = await getLottery(0);
    
  //   await lottery.connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
  //   await lottery.connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
  //   await lottery.connect(addrs[0]).buyTickets(1, {value: ethers.utils.parseEther('0.1')});

  //   await lotteryFactory.launchStaking(0);
  //   await lotteryFactory.declareWinner(0);

  //   expect([addr1.address, addr2.address, addrs[0].address]).to.include(await lottery.winner());
  //   expect(await lottery.state()).to.equal(2);
  //   expect(await lotteryFactory.numberOfActiveLotteries()).to.equal(numberOfActiveLotteries - 1);
  // });



  async function getLottery(index) {
    let l = await lotteryFactory.lotteries(index);
    Lottery = await ethers.getContractFactory("Lottery");
    return await Lottery.attach(l);;
  }

});