//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Lottery.sol";
import "hardhat/console.sol";

contract LotteryFactory is Ownable {

    // Variables
    // LotteryItem[] public lotteries;
    Lottery[] public lotteries;
    uint public maxActiveLotteries;
    uint public numberOfActiveLotteries;

    // Events
    event LotteryCreated(uint lotteryId, address lotteryAddress, address nftAddress, uint nftIndex, uint ticketPrice);
    event MaxActiveLotteriesChanged(uint maxActiveLotteries);
    event PeriodsChanged(uint daysOpenPeriod, uint daysStakingPeriod);

    /**
    @notice Contract constructor method.
    */
    constructor() {
        maxActiveLotteries = 10;
        numberOfActiveLotteries = 0;
    }

    /**
    @notice Creates a new NFT lottery.
    @param _nftAddress - NFT contract's address.
    @param _nftIndex - NFT indentifier in its contract.
    @param _ticketPrice - Lottery ticket price.
     */
    function createLottery(address _nftAddress, uint _nftIndex, uint _ticketPrice) public onlyOwner {
        // Check if nft transfer is approved !!!!!!!!!!!!!!!!!!!!!!!!!!
        require(numberOfActiveLotteries < maxActiveLotteries, 'Maximum of active lotteries has already been reached');
        require(_nftAddress != address(0), 'A valid address is required');
        require(_ticketPrice > 0, 'A valid ticket price is required');

        Lottery instance = new Lottery(lotteries.length, _nftAddress, _nftIndex, _ticketPrice);
        lotteries.push(instance);
        numberOfActiveLotteries++;

        emit LotteryCreated(lotteries.length - 1, address(instance), _nftAddress, _nftIndex, _ticketPrice);
    }

    /**
     @notice Sets number of maximum active lotteries.
     @param _maxActiveLotteries - New maximum.
     */
    function setMaxActiveLotteries(uint _maxActiveLotteries) public onlyOwner {
        maxActiveLotteries = _maxActiveLotteries;
        emit MaxActiveLotteriesChanged(maxActiveLotteries);
    }

    /**
     @notice Changes de lottery state to staking.
     @param _lotteryId - Lottery identifier.
     */
    function launchStaking(uint _lotteryId) public onlyOwner {
        lotteries[_lotteryId].launchStaking();
    }

    /**
     @notice Declares a winner and closes the lottery.
     @param _lotteryId - Lottery identifier.
     */
    function declareWinner(uint _lotteryId) public onlyOwner {
        lotteries[_lotteryId].declareWinner();
        numberOfActiveLotteries--;
    }

}