const { ethers, upgrades } = require("hardhat");
const { use, expect, assert } = require("chai");
const { solidity } = require("ethereum-waffle");

var BigNumber = require('big-number');
const { Contract } = require("ethers");

use(solidity);

const LotteryPoolType = {
	STANDARD: 0,
	YIELD: 1
}

const LotteryPoolStatus = { 
    OPEN: 0,
    STAKING: 1,
    CLOSED: 2,
    CANCELLED: 3
}

describe("Echion Protocol", function () {
    let LotteryPoolFactory, EchionNFT;
    let lotteryPoolFactory;
    let timeout = 3000000;
//   let LotteryPoolFactory, LotteryPool, EchionNFT, LotteryPoolStaking;
//   let lotteryPoolFactory, nft, lotteryPoolStaking;
    let ticketPrice = ethers.utils.parseEther('0.1');
    let minProfit = ethers.utils.parseEther('0.1');
    let imageURI = "https://ipfs.io/ipfs/QmWNcYhEcggdm1TFt2m6WmGqqQwfFXudr5eFzKPtm1nYwq";
    let metadataURI = "https://ipfs.io/ipfs/QmUCxDBKCrx2JXV4ZNYLwhUPXqTvRAu6Zceoh1FNVumoec";
    let owner;
    let addr1;
    let addr2;
    let addrs;

    beforeEach(async function () {

        // Deploying contracts
        EchionNFT = await ethers.getContractFactory("EchionNFT");
        nft = await EchionNFT.deploy();
        expect(nft.address).to.properAddress;

        LotteryPoolFactory = await ethers.getContractFactory("LotteryPoolFactory");
        lotteryPoolFactory = await upgrades.deployProxy(LotteryPoolFactory, { initializer: 'initialize' });
        expect(lotteryPoolFactory.address).to.properAddress;
        
        await lotteryPoolFactory.setMinDaysOpen(0);    

        // Getting test accounts
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

        // NFT approvals
        await nft.connect(addrs[1]).mint(imageURI, metadataURI);
        // await nft.connect(addrs[1]).setApprovalForAll(lotteryPoolFactory.address, true);
        expect(await nft.ownerOf(0)).to.equal(addrs[1].address);

        await nft.connect(addrs[2]).mint(imageURI, metadataURI);
        // await nft.connect(addrs[2]).setApprovalForAll(lotteryPoolFactory.address, true);
        expect(await nft.ownerOf(1)).to.equal(addrs[2].address);
    });

    describe("Create Lottery", function () {

        it("Should create a new lottery", async function () {
            // Act
            await expect(
                lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, minProfit, LotteryPoolType.STANDARD)
            ).to.emit(lotteryPoolFactory, 'LotteryCreated');
    
            let lotteries = [await _getLotteryPool(0)];
    
            // Assert
            expect(await lotteryPoolFactory.numberOfActiveLotteries()).to.equal(1);
            expect(await lotteries[0].status()).to.equal(LotteryPoolStatus.OPEN);
            expect(await lotteries[0].creator()).to.equal(addrs[1].address);
        }).timeout(timeout);

        it("Should create multiple lotteries", async function () {
            // Act
            await expect(
                lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, minProfit, LotteryPoolType.STANDARD)
            ).to.emit(lotteryPoolFactory, 'LotteryCreated');
    
            await expect(
                lotteryPoolFactory.connect(addrs[2]).createLottery(nft.address, 1, ticketPrice, minProfit, LotteryPoolType.YIELD)
              ).to.emit(lotteryPoolFactory, 'LotteryCreated');
    
            let lotteries = [await _getLotteryPool(0), await _getLotteryPool(1)];
    
            // Assert
            expect(await lotteryPoolFactory.numberOfActiveLotteries()).to.equal(2);
            expect(await lotteries[0].status()).to.equal(LotteryPoolStatus.OPEN);
            expect(await lotteries[0].creator()).to.equal(addrs[1].address);
            expect(await lotteries[1].creator()).to.equal(addrs[2].address);
        }).timeout(timeout);

        it("Shouldn't create a new lottery if protocol is paused", async function () {
            // Act
            await lotteryPoolFactory.connect(owner).pause();

            // Assert
            await expect(
                lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, minProfit, LotteryPoolType.STANDARD)
            ).to.be.reverted;
        }).timeout(timeout);

    });

    describe("Buy Tickets", function () {

        it("Should buy lottery tickets", async function () {
            // Arrange
            await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, minProfit, LotteryPoolType.STANDARD);
            let lotteries = [await _getLotteryPool(0)];
        
            // Act
            await expect(
              lotteries[0].connect(addr1).buyTickets(2, {value: ethers.utils.parseEther('0.2')})
            ).to.emit(lotteries[0], 'TicketsBought');
            await lotteries[0].connect(addr2).buyTickets(1, {value: ethers.utils.parseEther('0.1')});
            
            // Assert
            expect(await lotteries[0].numberOfTickets()).to.equal(3);
            expect(await lotteries[0].ticketsOf(addr1.address)).to.equal(2)
            expect(await lotteries[0].ticketsOf(addr2.address)).to.equal(1)
            expect(await lotteries[0].totalSupply()).to.equal(ethers.utils.parseEther('0.3'));
        }).timeout(timeout);

        it("Shouldn't buy lottery tickets if protocol is paused", async function () {
            // Arrange
            await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, minProfit, LotteryPoolType.STANDARD);
            let lotteries = [await _getLotteryPool(0)];
        
            // Act
            await lotteryPoolFactory.connect(owner).pause();
            
            // Assert
            await expect(
                lotteries[0].connect(addr2).buyTickets(1, {value: ethers.utils.parseEther('0.1')})
            ).to.be.revertedWith('Protocol has been paused by security');
        }).timeout(timeout);

        it("Should update total supply when buying tickets", async function () {
            // Arrange
            await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, minProfit, LotteryPoolType.STANDARD);
            await lotteryPoolFactory.connect(addrs[2]).createLottery(nft.address, 1, ticketPrice, minProfit, LotteryPoolType.STANDARD);
            let lotteries = [await _getLotteryPool(0), await _getLotteryPool(1)];
        
            // Act
            await lotteries[0].connect(addr1).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
            await lotteries[0].connect(addr2).buyTickets(1, {value: ethers.utils.parseEther('0.1')});
            await lotteries[1].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
            await lotteries[1].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
            
            // Assert
            expect(await lotteryPoolFactory.totalSupply()).to.equal(ethers.utils.parseEther('0.8'));
        }).timeout(timeout);

        it("Shouldn't update total supply if caller is not a pool contract", async function () {
            // Arrange
            await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, minProfit, LotteryPoolType.STANDARD);

            // Assert
            await expect(
                lotteryPoolFactory.increaseTotalSupply(0, ethers.utils.parseEther('0.2'))
            ).to.be.revertedWith("This method must be called through a lottery child contract");
        }).timeout(timeout);

    });

    describe("Redeem Tickets", function () {

        it("Should redeem tickets when pool is open", async function () {
            // Arrange
            await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, minProfit, LotteryPoolType.STANDARD);
            let lotteries = [await _getLotteryPool(0)];
        
            // Act
            await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
            await lotteries[0].connect(addr2).buyTickets(1, {value: ethers.utils.parseEther('0.1')});
            await expect(
              lotteries[0].connect(addr1).redeemTickets(2)
            ).to.emit(lotteries[0], 'TicketsRedeemed');
            
            // Assert
            expect(await lotteries[0].numberOfTickets()).to.equal(2);
            expect(await lotteries[0].ticketsOf(addr1.address)).to.equal(1)
            expect(await lotteries[0].totalSupply()).to.equal(ethers.utils.parseEther('0.2'));
        }).timeout(timeout);

        it("Should redeem tickets when Yield pool is closed", async function() {
            // Arrange 
            await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, minProfit, LotteryPoolType.YIELD);    
            let lotteries = [await _getLotteryPool(0)];

            await nft.connect(addrs[1]).approve(lotteries[0].address, 0);
            
            await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
            await lotteries[0].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
            await lotteries[0].connect(addrs[0]).buyTickets(1, {value: ethers.utils.parseEther('0.1')});

            await lotteries[0].connect(addrs[1]).launchStaking();
            await lotteries[0].connect(addrs[1]).declareWinner();
        
            // Act
            const balance = await addr1.getBalance();
            await lotteries[0].connect(addr1).redeemTickets(3);
        
            // Assert
            expect(await addr1.getBalance()).to.be.above(balance);
            expect(await lotteries[0].ticketsOf(addr1.address)).to.equal(0);
        }).timeout(timeout);

        it("Shouldn't be able to redeem tickets if pool isn't closed", async function() {
            // Arrange 
            await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, minProfit, LotteryPoolType.YIELD);    
            let lotteries = [await _getLotteryPool(0)];

            await nft.connect(addrs[1]).approve(lotteries[0].address, 0);
            
            await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
            await lotteries[0].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
            await lotteries[0].connect(addrs[0]).buyTickets(1, {value: ethers.utils.parseEther('0.1')});

            // Act
            await lotteries[0].connect(addrs[1]).launchStaking();
        
            // Assert
            await expect (
                lotteries[0].connect(addr1).redeemTickets(3)
            ).to.be.revertedWith("Cannot redeem tickets during staking process");
        }).timeout(timeout);

        it("Shouldn't be able to redeem tickets in a closed standard pool", async function() {
            // Arrange
            await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, minProfit, LotteryPoolType.STANDARD);
            let lotteries = [await _getLotteryPool(0)];

            await nft.connect(addrs[1]).approve(lotteries[0].address, 0);
            
            await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
            await lotteries[0].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
            await lotteries[0].connect(addrs[0]).buyTickets(1, {value: ethers.utils.parseEther('0.1')});
            
            // Act
            await lotteries[0].connect(addrs[1]).declareWinner();
        
            // Assert
            await expect (
              lotteries[0].connect(addr1).redeemTickets(3)
            ).to.be.revertedWith('Cannot redeem from a standard closed pool');
        }).timeout(timeout);

        it("Shouldn't be able to redeem more tickets than tickets bought", async function() {
            // Arrange
            await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, minProfit, LotteryPoolType.STANDARD);
            let lotteries = [await _getLotteryPool(0)];

            await nft.connect(addrs[1]).approve(lotteries[0].address, 0);
            
            await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
            await lotteries[0].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
            await lotteries[0].connect(addrs[0]).buyTickets(1, {value: ethers.utils.parseEther('0.1')});
        
            // Assert
            await expect (
              lotteries[0].connect(addr1).redeemTickets(10)
            ).to.be.revertedWith('You do not have enough tickets');
        }).timeout(timeout);

        it("Should update total supply when redeeming tickets", async function () {
            // Arrange
            await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, minProfit, LotteryPoolType.STANDARD);
            await lotteryPoolFactory.connect(addrs[2]).createLottery(nft.address, 1, ticketPrice, minProfit, LotteryPoolType.STANDARD);
            let lotteries = [await _getLotteryPool(0), await _getLotteryPool(1)];
        
            // Act
            await lotteries[0].connect(addr1).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
            await lotteries[0].connect(addr2).buyTickets(1, {value: ethers.utils.parseEther('0.1')});
            await lotteries[1].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
            await lotteries[1].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
            await lotteries[0].connect(addr1).redeemTickets(1);
            await lotteries[1].connect(addr2).redeemTickets(1);
            
            // Assert
            expect(await lotteryPoolFactory.totalSupply()).to.equal(ethers.utils.parseEther('0.6'));
        }).timeout(timeout);

    });

    describe("Launch Staking", function () {
        
        it("Should stake a lottery", async function () {
            // Arrange
            await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, minProfit, LotteryPoolType.YIELD);
            let lotteries = [await _getLotteryPool(0)];
            await lotteries[0].connect(addr1).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
        
            // Act
            await expect(
                    lotteries[0].connect(addrs[1]).launchStaking()
            ).to.emit(lotteryPoolFactory, 'LotteryStaked');
            
            // Assert
            expect(await lotteries[0].status()).to.equal(LotteryPoolStatus.STAKING);
        }).timeout(timeout);
    
        it("Shouldn't stake a lottery if sender isn't the owner", async function () {
            // Arrange
            await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, minProfit, LotteryPoolType.YIELD);
            let lotteries = [await _getLotteryPool(0)];
            
            // Act
            await expect(
                lotteries[0].connect(addrs[2]).launchStaking()
            ).to.be.revertedWith('Only pool creator can call this method');
        }).timeout(timeout);
        
        it("Shouldn't stake a lottery if minimum days open hasn't been reached", async function () {
            // Arrange
            await lotteryPoolFactory.setMinDaysOpen(7);
            await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, minProfit, LotteryPoolType.YIELD);
            let lotteries = [await _getLotteryPool(0)];
            await lotteries[0].connect(addr1).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
        
            // Act
            await expect(
                    lotteries[0].connect(addrs[1]).launchStaking()
            ).to.be.revertedWith('You must wait the minimum open days');
        }).timeout(timeout);

    });

    describe("Declare Winner", function () {

        it("Should declare a winner in a standard pool", async function () {
            // Arrange
            await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, minProfit, LotteryPoolType.STANDARD);
            let numberOfActiveLotteries = await lotteryPoolFactory.numberOfActiveLotteries();
            let lotteries = [await _getLotteryPool(0)];
    
            await nft.connect(addrs[1]).approve(lotteries[0].address, 0);
            
            await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
            await lotteries[0].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
            await lotteries[0].connect(addrs[0]).buyTickets(1, {value: ethers.utils.parseEther('0.1')});
    
            // Act
            await lotteries[0].connect(addrs[1]).declareWinner();
    
            // Assert
            expect([addr1.address, addr2.address, addrs[0].address]).to.include(await lotteries[0].winner());
            expect(await lotteries[0].status()).to.equal(LotteryPoolStatus.CLOSED);
            expect(await lotteryPoolFactory.numberOfActiveLotteries()).to.equal(numberOfActiveLotteries - 1);
            expect(await lotteries[0].profit()).to.be.above(0);
            expect(await lotteries[0].fees()).to.be.above(0);
        }).timeout(timeout);
    
        it("Should declare a winner in a yield lottery pool", async function () {
            await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, minProfit, LotteryPoolType.YIELD);
            let numberOfActiveLotteries = await lotteryPoolFactory.numberOfActiveLotteries();
            let lotteries = [await _getLotteryPool(0)];

            await nft.connect(addrs[1]).approve(lotteries[0].address, 0);
            
            await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
            await lotteries[0].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
            await lotteries[0].connect(addrs[0]).buyTickets(1, {value: ethers.utils.parseEther('0.1')});
        
            await lotteries[0].connect(addrs[1]).launchStaking();
            await lotteries[0].connect(addrs[1]).declareWinner();
    
            expect([addr1.address, addr2.address, addrs[0].address]).to.include(await lotteries[0].winner());
            expect(await lotteries[0].status()).to.equal(LotteryPoolStatus.CLOSED);
            expect(await lotteryPoolFactory.numberOfActiveLotteries()).to.equal(numberOfActiveLotteries - 1);
            // expect(await lotteries[0].profit()).to.be.above(0);
            // expect(await lotteries[0].fees()).to.be.above(0);
        }).timeout(timeout);
    
        it("Should transfer NFT to winner", async function () {
            // Arrange
            await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, minProfit, LotteryPoolType.STANDARD);
            let lotteries = [await _getLotteryPool(0)];
            expect(await lotteries[0].creator()).to.equal(addrs[1].address);
    
            await nft.connect(addrs[1]).approve(lotteries[0].address, 0);

            await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
            await lotteries[0].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
            await lotteries[0].connect(addrs[0]).buyTickets(1, {value: ethers.utils.parseEther('0.1')});
    
            // Act
            await lotteries[0].connect(addrs[1]).declareWinner();
    
            // Assert
            const winner = await lotteries[0].winner();
            expect(await nft.ownerOf(0)).to.equal(winner);
          }).timeout(timeout);
    
        it("Shouldn't declare a winner if it's already been declared", async function () {
            // Arrange
            await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, minProfit, LotteryPoolType.STANDARD);
            let lotteries = [await _getLotteryPool(0)];
    
            await nft.connect(addrs[1]).approve(lotteries[0].address, 0);
            
            await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
            await lotteries[0].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
            await lotteries[0].connect(addrs[0]).buyTickets(1, {value: ethers.utils.parseEther('0.1')});
        
            // Act
            await lotteries[0].connect(addrs[1]).declareWinner();
        
            // Assert
            await expect(
                lotteries[0].connect(addrs[1]).declareWinner()
            ).to.be.revertedWith('A winner has already been declared');
        }).timeout(timeout);
        
        it("Shouldn't close a lottery if sender isn't the creator", async function () {
            // Arrange
            await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, minProfit, LotteryPoolType.STANDARD);
            let lotteries = [await _getLotteryPool(0)];

            await nft.connect(addrs[1]).approve(lotteries[0].address, 0);
            
            await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
        
            // Assert
            await expect(
                lotteries[0].connect(addrs[2]).declareWinner()
            ).to.be.revertedWith('Only pool creator can call this method');
        }).timeout(timeout);
        
        it("Shouldn't close a lottery if minimum days open hasn't been reached", async function () {
            // Arrange
            await lotteryPoolFactory.setMinDaysOpen(7);
            await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, minProfit, LotteryPoolType.STANDARD);
            let lotteries = [await _getLotteryPool(0)];

            await nft.connect(addrs[1]).approve(lotteries[0].address, 0);
        
            // Act
            await expect(
                lotteries[0].connect(addrs[1]).declareWinner()
            ).to.be.revertedWith('You must wait the minimum open days');
        }).timeout(timeout);
        
        it("Shouldn't close a staking lottery if is not staking", async function () {
            await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, minProfit, LotteryPoolType.YIELD);
            let lotteries = [await _getLotteryPool(0)];

            await nft.connect(addrs[1]).approve(lotteries[0].address, 0);

            await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
        
            await expect(
                lotteries[0].connect(addrs[1]).declareWinner()
            ).to.be.revertedWith('The lottery pool is not in staking phase');
        }).timeout(timeout);

    });

    describe("Redeem Profit", function () {

        it("Creator should be able to redeem his profit", async function () {
            // Arrange
            await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, minProfit, LotteryPoolType.STANDARD);            
            let lotteries = [await _getLotteryPool(0)];
            
            await nft.connect(addrs[1]).approve(lotteries[0].address, 0);
            
            await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
            await lotteries[0].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
            await lotteries[0].connect(addrs[0]).buyTickets(1, {value: ethers.utils.parseEther('0.1')});

            await lotteries[0].connect(addrs[1]).declareWinner();

            // Act
            const creatorBalance = await addrs[1].getBalance();
            await lotteries[0].connect(addrs[1]).redeemProfit();
        
            // Assert
            expect(await addrs[1].getBalance()).to.be.above(creatorBalance);
        });

        it("Shouldn't be able to redeem profit if not the creator", async function () {
            // Arrange
            await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, minProfit, LotteryPoolType.STANDARD);            
            let lotteries = [await _getLotteryPool(0)];
            
            await nft.connect(addrs[1]).approve(lotteries[0].address, 0);
            
            await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
            await lotteries[0].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
            await lotteries[0].connect(addrs[0]).buyTickets(1, {value: ethers.utils.parseEther('0.1')});

            await lotteries[0].connect(addrs[1]).declareWinner();

            // Assert
            await expect(
                lotteries[0].connect(addrs[2]).redeemProfit()
            ).to.be.revertedWith("Only pool creator can call this method");        
        });

        it("Creator shouldn't be able to redeem twice", async function () {
            // Arrange
            await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, minProfit, LotteryPoolType.STANDARD);            
            let lotteries = [await _getLotteryPool(0)];
            
            await nft.connect(addrs[1]).approve(lotteries[0].address, 0);
            
            await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
            await lotteries[0].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
            await lotteries[0].connect(addrs[0]).buyTickets(1, {value: ethers.utils.parseEther('0.1')});

            await lotteries[0].connect(addrs[1]).declareWinner();

            // Act
            await lotteries[0].connect(addrs[1]).redeemProfit();
        
            // Assert
            await expect(
                lotteries[0].connect(addrs[1]).redeemProfit()
            ).to.be.revertedWith("Payment already transfered to creator");
        });

    });

    describe("Cancel Lottery", function () {

        it("Should cancel a lottery", async function () {
            // Arrange
            //await lotteryPoolFactory.setMinDaysOpen(7);
            minProfit = ethers.utils.parseEther('2');
            await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, minProfit, LotteryPoolType.YIELD);
            let lotteries = [await _getLotteryPool(0)];
        
            await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
            await lotteries[0].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
            await lotteries[0].connect(addrs[0]).buyTickets(1, {value: ethers.utils.parseEther('0.1')});
        
            // Act
            await expect(
                lotteries[0].connect(addrs[1]).cancelLottery()
            ).to.emit(lotteryPoolFactory, 'LotteryCancelled');
            
            // Assert
            expect(await lotteries[0].status()).to.equal(LotteryPoolStatus.CANCELLED);
        }).timeout(timeout);

        it("Shouldn't cancel a lottery if minimum amount has been reached", async function () {
            // Arrange
            minProfit = ethers.utils.parseEther('0.1'); 
            await lotteryPoolFactory.connect(addrs[1]).createLottery(nft.address, 0, ticketPrice, minProfit, LotteryPoolType.YIELD);
            let lotteries = [await _getLotteryPool(0)];
        
            await lotteries[0].connect(addr1).buyTickets(3, {value: ethers.utils.parseEther('0.3')});
            await lotteries[0].connect(addr2).buyTickets(2, {value: ethers.utils.parseEther('0.2')});
            await lotteries[0].connect(addrs[0]).buyTickets(1, {value: ethers.utils.parseEther('0.1')});
        
            // Act
            await expect(
                lotteries[0].connect(addrs[1]).cancelLottery()
            ).to.be.revertedWith('Cannot cancel lottery. The minimum amount has been reached');
        }).timeout(timeout);

    });

    describe("Others", function () {

        it("Should be able to update fee percent", async function () {  
            // Arrange
            expect(await lotteryPoolFactory.getFeePercent()).to.equal(10);
    
            // Act
            await expect(
                await lotteryPoolFactory.connect(owner).setFeePercent(20)
            ).to.emit(lotteryPoolFactory, 'FeePercentChanged');
        
            // Assert
            expect(await lotteryPoolFactory.getFeePercent()).to.equal(20);
        }).timeout(timeout);
    
        it("Shouldn't update fee percent when sender isn't the owner", async function () {   
            await expect(
                lotteryPoolFactory.connect(addr1).setFeePercent(20)
            ).to.be.reverted;
        }).timeout(timeout);

        it("Should be able to update the wallet address", async function () {   
            expect(await lotteryPoolFactory.getWallet()).to.equal(owner.address);
            await expect(
              lotteryPoolFactory.connect(owner).setWallet(addrs[3].address)
            ).to.emit(lotteryPoolFactory, 'WalletChanged');
            expect(await lotteryPoolFactory.getWallet()).to.equal(addrs[3].address);
        }).timeout(timeout);
        
        it("Shouldn't be able to update the wallet address if not the owner", async function () {   
              await expect(
                lotteryPoolFactory.connect(addr2).setWallet(addrs[3].address)
              ).to.be.reverted;
        }).timeout(timeout);
        
        it("Should be able to update the minimum days open", async function () {
            await expect(
              lotteryPoolFactory.connect(owner).setMinDaysOpen(2)
            ).to.emit(lotteryPoolFactory, 'MinDaysOpenChanged');
            expect(await lotteryPoolFactory.getMinDaysOpen()).to.equal(2);
        }).timeout(timeout);
        
        it("Shouldn't be able to update the minimum days open if not the owner", async function () {   
              await expect(
                lotteryPoolFactory.connect(addr2).setMinDaysOpen(3)
              ).to.be.reverted;
        }).timeout(timeout);

    });

    // Private methods

    async function _getLotteryPool(index) {
        let lottery = await lotteryPoolFactory.lotteries(index);        
        StandardLotteryPool = await ethers.getContractFactory("StandardLotteryPool");
        let contract = StandardLotteryPool.attach(lottery);

        // Getting pool type
        let poolType = await contract.lotteryPoolType();
        if(poolType == LotteryPoolType.STANDARD)
            return contract;
        else {
            YieldLotteryPool = await ethers.getContractFactory("YieldLotteryPool");
            return YieldLotteryPool.attach(lottery);
        }
    }

});