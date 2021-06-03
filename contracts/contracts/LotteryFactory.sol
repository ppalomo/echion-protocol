//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Lottery.sol";
import "hardhat/console.sol";

/// @title Echion lotteries factory contract
/// @author Pablo Palomo
/// @notice Contract used for maintaining the list of lotteries and interact with them
contract LotteryFactory is Ownable {

    // Variables
    Lottery[] public lotteries;
    uint public numberOfActiveLotteries;
    uint public totalBalance;

    // Events
    event LotteryCreated(uint lotteryId, address creator, address lotteryAddress, address nftAddress, uint nftIndex, uint ticketPrice, uint created);
    event LotteryStaked(uint lotteryId);

    /// @notice Contract constructor method
    constructor() {
        numberOfActiveLotteries = 0;
        totalBalance = 0;
    }

    /// @notice Creates a new NFT lottery
    /// @param _nftAddress NFT contract's address
    /// @param _nftIndex NFT indentifier in its contract
    /// @param _ticketPrice Lottery ticket price
    function createLottery(address _nftAddress, uint _nftIndex, uint _ticketPrice) public {
        require(_nftAddress != address(0), 'A valid address is required');
        require(_ticketPrice > 0, 'A valid ticket price is required');

        // Check if nft transfer is approved !!!!!!!!!!!!!!!!!!!!!!!!!!

        uint created = block.timestamp;
        Lottery instance = new Lottery(lotteries.length, msg.sender, _nftAddress, _nftIndex, _ticketPrice, created);
        lotteries.push(instance);
        numberOfActiveLotteries++;

        // Emiting event
        emit LotteryCreated(lotteries.length - 1, msg.sender, address(instance), _nftAddress, _nftIndex, _ticketPrice, created);
    }

    /// @notice Increases the total balance
    /// @dev Only can be called by a child Lottery contract
    /// @param _lotteryId Lottery child contract identifier
    /// @param _amount Amount to increase balance
    function increaseTotalBalance(uint _lotteryId, uint _amount) public {
        require(msg.sender == address(lotteries[_lotteryId]), 'This method must be called through a lottery child contract');
        totalBalance += _amount;
    }

    /// @notice Decreases the total balance
    /// @dev Only can be called by a child Lottery contract
    /// @param _lotteryId Lottery child contract identifier
    /// @param _amount Amount to decrease balance
    function decreaseTotalBalance(uint _lotteryId, uint _amount) public {
        require(msg.sender == address(lotteries[_lotteryId]), 'This method must be called through a lottery child contract');
        totalBalance -= _amount;
    }
    
    /// @notice Changes de lottery state to staking.
    /// @param _lotteryId - Lottery identifier.
    function launchStaking(uint _lotteryId) public {
        Lottery lottery = lotteries[_lotteryId];
        require(lottery.creator() == msg.sender, 'You are not the owner of the lottery');

        // Launching lottery staking process
        lottery.launchStaking();

        // Emiting event
        emit LotteryStaked(_lotteryId);
    }

    /**
     @notice Declares a winner and closes the lottery.
     @param _lotteryId - Lottery identifier.
     */
    function declareWinner(uint _lotteryId) public onlyOwner {
        Lottery lottery = lotteries[_lotteryId];
        require(lottery.creator() == msg.sender, 'You are not the owner of the lottery');

        // Launching winner declaration process
        address winner = lottery.declareWinner();
        numberOfActiveLotteries--;

        // Emiting event
        emit LotteryClosed(_lotteryId, winner);
    }

}