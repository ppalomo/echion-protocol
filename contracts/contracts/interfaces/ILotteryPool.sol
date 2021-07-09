//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

/// @title LotteryPool interface
interface ILotteryPool {
    enum LotteryPoolStatus { OPEN, STAKING, CLOSED, CANCELLED }

    function init(
        address _parent,
        uint _lotteryId,
        address _creator, 
        address _nftAddress, 
        uint _nftIndex, 
        uint _ticketPrice,
        uint _minProfit,
        uint _created,
        uint _lotteryPoolType) external;

    function buyTickets(uint _numberOfTickets) external payable;

    function redeemProfit() external;

    function declareWinner() external;

    function cancelLottery() external;

    function ticketsOf(address _addr) external view returns (uint);

    function getBalance() external view returns (uint);
    
}