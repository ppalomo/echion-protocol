//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

/// @title LotteryPoolFactory interface
interface ILotteryPoolFactory {
    
    enum LotteryPoolType { DIRECT, STAKING }

    function createLottery(address _nftAddress, uint _nftIndex, uint _ticketPrice, LotteryPoolType _lotteryPoolType, uint _minAmount) external;
    function launchStaking(uint _lotteryId) external;
    function declareWinner(uint _lotteryId) external;
    function cancelLottery(uint _lotteryId) external;
    function increaseTotalBalance(uint _lotteryId, uint _amount) external;
    function decreaseTotalBalance(uint _lotteryId, uint _amount) external;
    function getFeePercent() external view returns(uint);
    function setFeePercent(uint _feePercent) external;
    function getWallet() external view returns(address);
    function setWallet(address payable _addr) external;
    function getMinDaysOpen() external view returns(uint);
    function setMinDaysOpen(uint _minDaysOpen) external;

}