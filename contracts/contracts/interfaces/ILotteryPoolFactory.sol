//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./ILotteryPool.sol";

/// @title LotteryPoolFactory interface
interface ILotteryPoolFactory {

    function createLottery(address _nftAddress, uint _nftIndex, uint _ticketPrice, uint _minProfit, ILotteryPool.LotteryPoolType _lotteryPoolType) external;
    // function launchStaking(uint _lotteryId) external;
    // function declareWinner(uint _lotteryId) external;
    // function cancelLottery(uint _lotteryId) external;
    function increaseTotalSupply(uint _lotteryId, uint _amount) external;
    function decreaseTotalSupply(uint _lotteryId, uint _amount) external;
    function lotteryStaked(uint _lotteryId, uint _amount) external;
    function lotteryClosed(uint _lotteryId, address _winner, uint _profit, uint _fees) external;
    function lotteryCancelled(uint _lotteryId, uint _fees) external;

    // function getLotteryPoolInfo(uint _lotteryPoolId) external returns (address, uint);

    function getFeePercent() external view returns(uint);
    // function setFeePercent(uint _feePercent) external;
    function getWallet() external view returns(address);
    // function setWallet(address payable _addr) external;
    function getMinDaysOpen() external view returns(uint);
    // function setMinDaysOpen(uint _minDaysOpen) external;
    // function getLotteryPoolStaking() external view returns(address);
    function paused() external view returns (bool);
    
}