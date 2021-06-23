//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

/// @title LotteryPool interface
interface ILotteryPool {

    enum LotteryStatus { OPEN, STAKING, CLOSED, CANCELLED }

    function buyTickets(uint _numberOfTickets) external payable;
    function cancelTickets(uint _numberOfTickets) external;
    function redeemTickets() external;
    function launchStaking() external;
    function declareWinner() external returns (address);
    function cancelLottery() external;
    function ticketsOf(address _addr) external view returns (uint);
    function getBalance() external view returns (uint);

}