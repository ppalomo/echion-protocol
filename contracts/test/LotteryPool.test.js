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
  let LotteryPoolFactory, LotteryPool;
  let lotteryPoolFactory;
  let owner;
  let addr1;
  let addr2;
  let addrs;
  let nfts = [
    {
      ticketPrice: ethers.utils.parseEther('0.1'),
      minAmount: ethers.utils.parseEther('0.1'),
      address: "0xE1A19Eb074815e4028768182F8971D222416159A",
      index: 0
    },
    { 
      ticketPrice: ethers.utils.parseEther('0.1'),
      minAmount: ethers.utils.parseEther('0.1'),
      address: "0x88b0256bf2af5495853bea5fd6ed4b29f23b1a41",
      index: 5
    },
    {
      ticketPrice: ethers.utils.parseEther('0.1'),
      minAmount: ethers.utils.parseEther('0.1'),
      address: "0x6f86a5f81cb7428fabddfc545b1967e51da7a201",
      index: 0
    }
  ]

  beforeEach(async function () {
    
    // Deploying contract
    LotteryPoolFactory = await ethers.getContractFactory("LotteryPoolFactory");
    lotteryPoolFactory = await LotteryPoolFactory.deploy();
    expect(lotteryPoolFactory.address).to.properAddress;

    await lotteryPoolFactory.setMinDaysOpen(0);

    // Getting test accounts
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
  });

  it("Should create a new lottery", async function () {
    // Act
    await expect(
      lotteryPoolFactory.connect(addr1).createLottery(nfts[0].address, nfts[0].index, nfts[0].ticketPrice, LotteryPoolType.DIRECT, nfts[0].minAmount)
    ).to.emit(lotteryPoolFactory, 'LotteryCreated');
    await expect(
      lotteryPoolFactory.connect(addr2).createLottery(nfts[1].address, nfts[1].index, nfts[1].ticketPrice, LotteryPoolType.STAKING, nfts[1].minAmount)
    ).to.emit(lotteryPoolFactory, 'LotteryCreated');

    let lotteries = [await getLotteryPool(0), await getLotteryPool(1)];

    // Assert
    expect(await lotteryPoolFactory.numberOfActiveLotteries()).to.equal(2);
    expect(await lotteries[0].status()).to.equal(LotteryStatus.OPEN);
    expect(await lotteries[0].creator()).to.equal(addr1.address);
    expect(await lotteries[1].creator()).to.equal(addr2.address);
  });

  it("Should buy lottery tickets", async function () {
    // Arrange
    await lotteryPoolFactory.createLottery(nfts[0].address, nfts[0].index, nfts[0].ticketPrice, LotteryPoolType.DIRECT, nfts[0].minAmount);        
    let lotteries = [await getLotteryPool(0)];

    // Act
    await expect(
      lotteries[0].connect(addr1).buyTickets(2, {value: ethers.utils.parseEther('0.2')})
    ).to.emit(lotteries[0], 'TicketsBought');
    await lotteries[0].connect(addr2).buyTickets(1, {value: ethers.utils.parseEther('0.1')});
    
    // Assert
    expect(await lotteries[0].numberOfTickets()).to.equal(3);
    expect(await lotteries[0].ticketsOf(addr1.address)).to.equal(2)
    expect(await lotteries[0].ticketsOf(addr2.address)).to.equal(1)
    expect(await lotteries[0].getBalance()).to.equal(ethers.utils.parseEther('0.3'));
  });

  it("Shouldn't buy a ticket if the lottery is not open", async function () {    
    await lotteryPoolFactory.createLottery(nfts[0].address, nfts[0].index, nfts[0].ticketPrice, LotteryPoolType.STAKING, nfts[0].minAmount);
    await lotteryPoolFactory.launchStaking(0);

    let lotteries = [await getLotteryPool(0)];

    await expect(
      lotteries[0].connect(addr1).buyTickets(1, {value: ethers.utils.parseEther('0.1')})
    ).to.be.revertedWith('The lottery pool is not open');
  });

  it("Should update total balance when buying tickets", async function () {
    // Arrange
    await lotteryPoolFactory.createLottery(nfts[0].address, nfts[0].index, nfts[0].ticketPrice, LotteryPoolType.DIRECT, nfts[0].minAmount);
    await lotteryPoolFactory.createLottery(nfts[1].address, nfts[1].index, nfts[1].ticketPrice, LotteryPoolType.DIRECT, nfts[1].minAmount);
    let lotteries = [await getLotteryPool(0), await getLotteryPool(1)];

    // Act
    await lotteries[0].connect(addr1).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
    await lotteries[0].connect(addr2).buyTickets(1, {value: ethers.utils.parseEther('0.1')});
    await lotteries[1].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
    await lotteries[1].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
    
    // Assert
    expect(await lotteryPoolFactory.totalBalance()).to.equal(ethers.utils.parseEther('0.8'));
  });

  it("Should cancel tickets", async function () {
    // Arrange
    await lotteryPoolFactory.createLottery(nfts[0].address, nfts[0].index, nfts[0].ticketPrice, LotteryPoolType.DIRECT, nfts[0].minAmount);    
    let lotteries = [await getLotteryPool(0)];

    // Act
    await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
    await lotteries[0].connect(addr2).buyTickets(1, {value: ethers.utils.parseEther('0.1')});
    await expect(
      lotteries[0].connect(addr1).cancelTickets(2)
    ).to.emit(lotteries[0], 'TicketsCancelled');
    
    // Assert
    expect(await lotteries[0].numberOfTickets()).to.equal(2);
    expect(await lotteries[0].ticketsOf(addr1.address)).to.equal(1)
    expect(await lotteries[0].getBalance()).to.equal(ethers.utils.parseEther('0.2'));
  });

  it("Shouldn't cancel more tickets than tickets bought", async function () {
    // Arrange
    await lotteryPoolFactory.createLottery(nfts[0].address, nfts[0].index, nfts[0].ticketPrice, LotteryPoolType.STAKING, nfts[0].minAmount);
    let lotteries = [await getLotteryPool(0)];
    await lotteries[0].connect(addr1).buyTickets(2, {value: ethers.utils.parseEther('0.2')})

    // Assert
    await expect(
      lotteries[0].connect(addr1).cancelTickets(3)
    ).to.be.revertedWith('You do not have enough tickets');
  });

  it("Shouldn't cancel tickets if the lottery is not open", async function () {
    // Arrange
    await lotteryPoolFactory.createLottery(nfts[0].address, nfts[0].index, nfts[0].ticketPrice, LotteryPoolType.STAKING, nfts[0].minAmount);
    let lotteries = [await getLotteryPool(0)];
    await lotteries[0].connect(addr1).buyTickets(2, {value: ethers.utils.parseEther('0.2')})
    
    // Act
    await lotteryPoolFactory.launchStaking(0);

    // Assert
    await expect(
      lotteries[0].connect(addr1).cancelTickets(2)
    ).to.be.revertedWith('The lottery pool is not open');
  });

  it("Should update total balance when cancelling tickets", async function () {
    // Arrange
    await lotteryPoolFactory.createLottery(nfts[0].address, nfts[0].index, nfts[0].ticketPrice, LotteryPoolType.DIRECT, nfts[0].minAmount);
    await lotteryPoolFactory.createLottery(nfts[1].address, nfts[1].index, nfts[1].ticketPrice, LotteryPoolType.DIRECT, nfts[1].minAmount);
    let lotteries = [await getLotteryPool(0), await getLotteryPool(1)];

    // Act
    await lotteries[0].connect(addr1).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
    await lotteries[0].connect(addr2).buyTickets(1, {value: ethers.utils.parseEther('0.1')});
    await lotteries[1].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
    await lotteries[1].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
    await lotteries[0].connect(addr1).cancelTickets(1);
    await lotteries[1].connect(addr2).cancelTickets(1);
    
    // Assert
    expect(await lotteryPoolFactory.totalBalance()).to.equal(ethers.utils.parseEther('0.6'));
  });

  it("Should stake a lottery", async function () {
    // Arrange
    await lotteryPoolFactory.connect(addr1).createLottery(nfts[0].address, nfts[0].index, nfts[0].ticketPrice, LotteryPoolType.STAKING, nfts[0].minAmount);
    let lotteries = [await getLotteryPool(0)];

    // Act
    await expect(
      lotteryPoolFactory.connect(addr1).launchStaking(0)
    ).to.emit(lotteryPoolFactory, 'LotteryStaked');
    
    // Assert
    expect(await lotteries[0].status()).to.equal(LotteryStatus.STAKING);
  });

  it("Shouldn't stake a lottery if sender isn't the owner", async function () {
    // Arrange
    await lotteryPoolFactory.connect(addr1).createLottery(nfts[0].address, nfts[0].index, nfts[0].ticketPrice, LotteryPoolType.STAKING, nfts[0].minAmount);

    // Act
    await expect(
      lotteryPoolFactory.connect(addr2).launchStaking(0)
    ).to.be.revertedWith('You are not the owner of the lottery');
  });

  it("Shouldn't stake a lottery if minimum days open hasn't been reached", async function () {
    // Arrange
    await lotteryPoolFactory.setMinDaysOpen(7);
    await lotteryPoolFactory.connect(addr1).createLottery(nfts[0].address, nfts[0].index, nfts[0].ticketPrice, LotteryPoolType.STAKING, nfts[0].minAmount);

    // Act
    await expect(
      lotteryPoolFactory.connect(addr1).launchStaking(0)
    ).to.be.revertedWith('You must wait the minimum open days');
  });

  it("Shouldn't stake a lottery if pool type isn't compatible", async function () {
    // Arrange
    await lotteryPoolFactory.createLottery(nfts[0].address, nfts[0].index, nfts[0].ticketPrice, LotteryPoolType.DIRECT, nfts[0].minAmount);

    // Act
    await expect(
      lotteryPoolFactory.launchStaking(0)
    ).to.be.revertedWith('Lottery pool type is not compatible with staking');
  });

  it("Should declare a winner in a direct lottery pool", async function () {
    await lotteryPoolFactory.createLottery(nfts[0].address, nfts[0].index, nfts[0].ticketPrice, LotteryPoolType.DIRECT, nfts[0].minAmount);
    let numberOfActiveLotteries = await lotteryPoolFactory.numberOfActiveLotteries();
    let lotteries = [await getLotteryPool(0)];
    
    await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
    await lotteries[0].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
    await lotteries[0].connect(addrs[0]).buyTickets(1, {value: ethers.utils.parseEther('0.1')});

    await lotteryPoolFactory.declareWinner(0);

    expect([addr1.address, addr2.address, addrs[0].address]).to.include(await lotteries[0].winner());
    expect(await lotteries[0].status()).to.equal(LotteryStatus.CLOSED);
    expect(await lotteryPoolFactory.numberOfActiveLotteries()).to.equal(numberOfActiveLotteries - 1);
    expect(await lotteries[0].finalPrice()).to.be.above(0);
    expect(await lotteries[0].fees()).to.be.above(0);
  });

  it("Should declare a winner in a staking lottery pool", async function () {
    await lotteryPoolFactory.createLottery(nfts[0].address, nfts[0].index, nfts[0].ticketPrice, LotteryPoolType.STAKING, nfts[0].minAmount);
    let numberOfActiveLotteries = await lotteryPoolFactory.numberOfActiveLotteries();
    let lotteries = [await getLotteryPool(0)];
    
    await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
    await lotteries[0].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
    await lotteries[0].connect(addrs[0]).buyTickets(1, {value: ethers.utils.parseEther('0.1')});

    await lotteryPoolFactory.launchStaking(0);
    await lotteryPoolFactory.declareWinner(0);

    expect([addr1.address, addr2.address, addrs[0].address]).to.include(await lotteries[0].winner());
    expect(await lotteries[0].status()).to.equal(LotteryStatus.CLOSED);
    expect(await lotteryPoolFactory.numberOfActiveLotteries()).to.equal(numberOfActiveLotteries - 1);
  });

  it("Shouldn't declare a winner if lottery pool is closed", async function () {
    // Arrange
    await lotteryPoolFactory.createLottery(nfts[0].address, nfts[0].index, nfts[0].ticketPrice, LotteryPoolType.DIRECT, nfts[0].minAmount);
    let lotteries = [await getLotteryPool(0)];
    
    await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
    await lotteries[0].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
    await lotteries[0].connect(addrs[0]).buyTickets(1, {value: ethers.utils.parseEther('0.1')});

    // Act
    await lotteryPoolFactory.declareWinner(0);

    // Assert
    await expect(
      lotteryPoolFactory.declareWinner(0)
    ).to.be.revertedWith('The lottery pool is already closed');
  });

  it("Shouldn't close a lottery if sender isn't the owner", async function () {
    // Arrange
    await lotteryPoolFactory.connect(addr1).createLottery(nfts[0].address, nfts[0].index, nfts[0].ticketPrice, LotteryPoolType.DIRECT, nfts[0].minAmount);
    let lotteries = [await getLotteryPool(0)];
    
    await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});

    // Assert
    await expect(
      lotteryPoolFactory.connect(addr2).declareWinner(0)
    ).to.be.revertedWith('You are not the owner of the lottery');
  });

  it("Shouldn't close a lottery if minimum days open hasn't been reached", async function () {
    // Arrange
    await lotteryPoolFactory.setMinDaysOpen(7);
    await lotteryPoolFactory.connect(addr1).createLottery(nfts[0].address, nfts[0].index, nfts[0].ticketPrice, LotteryPoolType.DIRECT, nfts[0].minAmount);

    // Act
    await expect(
      lotteryPoolFactory.connect(addr1).declareWinner(0)
    ).to.be.revertedWith('You must wait the minimum open days');
  });

  it("Shouldn't close a staking lottery if is not staking", async function () {
    await lotteryPoolFactory.createLottery(nfts[0].address, nfts[0].index, nfts[0].ticketPrice, LotteryPoolType.STAKING, nfts[0].minAmount);
    let lotteries = [await getLotteryPool(0)];
    await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});

    await expect(
      lotteryPoolFactory.declareWinner(0)
    ).to.be.revertedWith('The lottery pool is not staking');
  });

  it("Should transfer fees when closing the direct lottery pool", async function () {
    // Arrange
    await lotteryPoolFactory.connect(addrs[1]).createLottery(nfts[0].address, nfts[0].index, nfts[0].ticketPrice, LotteryPoolType.DIRECT, nfts[0].minAmount);
    let lotteries = [await getLotteryPool(0)];
    
    await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
    await lotteries[0].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
    await lotteries[0].connect(addrs[0]).buyTickets(1, {value: ethers.utils.parseEther('0.1')});

    const ownerBalance = await owner.getBalance();
    const balance = await lotteries[0].getBalance();
    const feePercent = await lotteryPoolFactory.getFeePercent();
    const fee = balance * feePercent / 100;

    await lotteryPoolFactory.connect(addrs[1]).declareWinner(0);

    const expectedOwnerBalance = BigNumber(ownerBalance.toString()).plus(fee);
    const currentOwnerBalance = await owner.getBalance();
    expect(BigNumber(currentOwnerBalance.toString()).toString()).to.equal(expectedOwnerBalance.toString());
  });

  it("Should send payment to creator when closing a direct pool", async function () {
    // Arrange
    await lotteryPoolFactory.connect(addrs[1]).createLottery(nfts[0].address, nfts[0].index, nfts[0].ticketPrice, LotteryPoolType.DIRECT, nfts[0].minAmount);
    let lotteries = [await getLotteryPool(0)];
    
    await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
    await lotteries[0].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
    await lotteries[0].connect(addrs[0]).buyTickets(1, {value: ethers.utils.parseEther('0.1')});

    // Act
    const creatorBalance = await addrs[1].getBalance();
    await lotteryPoolFactory.connect(addrs[1]).declareWinner(0);

    // Assert
    expect(await addrs[1].getBalance()).to.be.above(creatorBalance);
  });

  it("Should cancel a lottery", async function () {
    // Arrange
    await lotteryPoolFactory.connect(addr1).createLottery(nfts[0].address, nfts[0].index, nfts[0].ticketPrice, LotteryPoolType.STAKING, ethers.utils.parseEther('10'));
    let lotteries = [await getLotteryPool(0)];

    await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
    await lotteries[0].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
    await lotteries[0].connect(addrs[0]).buyTickets(1, {value: ethers.utils.parseEther('0.1')});

    // Act
    await expect(
      lotteryPoolFactory.connect(addr1).cancelLottery(0)
    ).to.emit(lotteryPoolFactory, 'LotteryCancelled');
    
    // Assert
    expect(await lotteries[0].status()).to.equal(LotteryStatus.CANCELLED);
  });

  it("Shouldn't cancel a lottery if minimum amount has been reached", async function () {
    // Arrange
    await lotteryPoolFactory.connect(addr1).createLottery(nfts[0].address, nfts[0].index, nfts[0].ticketPrice, LotteryPoolType.STAKING, ethers.utils.parseEther('0.1'));
    let lotteries = [await getLotteryPool(0)];

    await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
    await lotteries[0].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
    await lotteries[0].connect(addrs[0]).buyTickets(1, {value: ethers.utils.parseEther('0.1')});

    // Act
    await expect(
      lotteryPoolFactory.connect(addr1).cancelLottery(0)
    ).to.be.revertedWith('Cannot cancel lottery. The minimum amount has been reached');
  });

  it("Should be able to redeem tickets in staking pool", async function() {
    // Arrange
    await lotteryPoolFactory.createLottery(nfts[0].address, nfts[0].index, nfts[0].ticketPrice, LotteryPoolType.STAKING, nfts[0].minAmount);    
    let lotteries = [await getLotteryPool(0)];
    
    await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
    await lotteries[0].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
    await lotteries[0].connect(addrs[0]).buyTickets(1, {value: ethers.utils.parseEther('0.1')});
    await lotteryPoolFactory.launchStaking(0);
    await lotteryPoolFactory.declareWinner(0);

    // Act
    const balance = await addr1.getBalance();
    await lotteries[0].connect(addr1).redeemTickets();

    // Assert
    expect(await addr1.getBalance()).to.be.above(balance);
    expect(await lotteries[0].ticketsOf(addr1.address)).to.equal(0);
  });

  it("Shouldn't be able to redeem tickets in direct pool", async function() {
    // Arrange
    await lotteryPoolFactory.createLottery(nfts[0].address, nfts[0].index, nfts[0].ticketPrice, LotteryPoolType.DIRECT, nfts[0].minAmount);    
    let lotteries = [await getLotteryPool(0)];
    
    await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
    await lotteries[0].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
    await lotteries[0].connect(addrs[0]).buyTickets(1, {value: ethers.utils.parseEther('0.1')});
    
    // Act
    await lotteryPoolFactory.declareWinner(0);

    // Assert
    await expect (
      lotteries[0].connect(addr1).redeemTickets()
    ).to.be.revertedWith('Tickets can only be redeemed in staking lottery pools');
  });

  it("Should be able to update fee percent", async function () {  
    // Arrange
    expect(await lotteryPoolFactory.getFeePercent()).to.equal(10);

    // Act
    await expect(
        await lotteryPoolFactory.connect(owner).setFeePercent(20)
    ).to.emit(lotteryPoolFactory, 'FeePercentChanged');

    // Assert
    expect(await lotteryPoolFactory.getFeePercent()).to.equal(20);
  });

  it("Shouldn't update fee percent when sender isn't the owner", async function () {   
    await expect(
      lotteryPoolFactory.connect(addr1).setFeePercent(20)
    ).to.be.reverted;
  });

  it("Should be able to update the wallet address", async function () {   
    expect(await lotteryPoolFactory.getWallet()).to.equal(owner.address);
    await expect(
      lotteryPoolFactory.connect(owner).setWallet(addrs[3].address)
    ).to.emit(lotteryPoolFactory, 'WalletChanged');
    expect(await lotteryPoolFactory.getWallet()).to.equal(addrs[3].address);
  });

  it("Shouldn't be able to update the wallet address if not the owner", async function () {   
      await expect(
        lotteryPoolFactory.connect(addr2).setWallet(addrs[3].address)
      ).to.be.reverted;
  });

  it("Should be able to update the minimum days open", async function () {
    await expect(
      lotteryPoolFactory.connect(owner).setMinDaysOpen(2)
    ).to.emit(lotteryPoolFactory, 'MinDaysOpenChanged');
    expect(await lotteryPoolFactory.getMinDaysOpen()).to.equal(2);
  });

  it("Shouldn't be able to update the minimum days open if not the owner", async function () {   
      await expect(
        lotteryPoolFactory.connect(addr2).setMinDaysOpen(3)
      ).to.be.reverted;
  });


  // Useful methods

  async function getLotteryPool(index) {
    let lottery = await lotteryPoolFactory.lotteries(index);
    LotteryPool = await ethers.getContractFactory("LotteryPool");
    return await LotteryPool.attach(lottery);    
  }

});