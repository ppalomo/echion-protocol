//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Lottery.sol";
import "hardhat/console.sol";

contract LotteryFactory is Ownable {

    // Variables
    Lottery[] public lotteries;
    uint public numberOfActiveLotteries;
    uint public totalBalance;

    // Events
    event LotteryCreated(uint lotteryId, address lotteryAddress, address nftAddress, uint nftIndex, uint ticketPrice, uint created);
    // event MaxActiveLotteriesChanged(uint maxActiveLotteries);
    // event PeriodsChanged(uint daysOpenPeriod, uint daysStakingPeriod);

    /**
    @notice Contract constructor method.
    */
    constructor() {
        numberOfActiveLotteries = 0;
        totalBalance = 0;
    }

    /**
    @notice Creates a new NFT lottery.
    @param _nftAddress - NFT contract's address.
    @param _nftIndex - NFT indentifier in its contract.
    @param _ticketPrice - Lottery ticket price.
     */
    function createLottery(address _nftAddress, uint _nftIndex, uint _ticketPrice) public {
        require(_nftAddress != address(0), 'A valid address is required');
        require(_ticketPrice > 0, 'A valid ticket price is required');

        // Check if nft transfer is approved !!!!!!!!!!!!!!!!!!!!!!!!!!

        uint created = block.timestamp;
        Lottery instance = new Lottery(lotteries.length, _nftAddress, _nftIndex, _ticketPrice, created);
        lotteries.push(instance);
        numberOfActiveLotteries++;

        emit LotteryCreated(lotteries.length - 1, address(instance), _nftAddress, _nftIndex, _ticketPrice, created);
    }

    // /**
    //  @notice Changes de lottery state to staking.
    //  @param _lotteryId - Lottery identifier.
    //  */
    // function launchStaking(uint _lotteryId) public onlyOwner {
    //     lotteries[_lotteryId].launchStaking();
    // }

    // /**
    //  @notice Declares a winner and closes the lottery.
    //  @param _lotteryId - Lottery identifier.
    //  */
    // function declareWinner(uint _lotteryId) public onlyOwner {
    //     lotteries[_lotteryId].declareWinner();
    //     numberOfActiveLotteries--;
    // }

    function increaseTotalBalance(uint _lotteryId, uint _amount) public {
        require(msg.sender == address(lotteries[_lotteryId]), 'This method must be called through a lottery child contract');
        totalBalance += _amount;
    }

    function decreaseTotalBalance(uint _lotteryId, uint _amount) public {
        require(msg.sender == address(lotteries[_lotteryId]), 'This method must be called through a lottery child contract');
        totalBalance -= _amount;
    }

}