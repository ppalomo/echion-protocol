//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./ILotteryPool.sol";

/// @title LotteryPoolFactory interface
interface ILotteryPoolFactory {
    
    function createLottery(address _nftAddress, uint _nftIndex, uint _ticketPrice, uint _minProfit, uint _lotteryPoolType) external;

    function increaseTotalSupply(uint _lotteryId, uint _amount) external;

    function decreaseTotalSupply(uint _lotteryId, uint _amount) external;

    function lotteryStaked(uint _lotteryId, uint _amount) external;

    function lotteryClosed(uint _lotteryId, address _winner, uint _profit, uint _fees) external;

    function lotteryCancelled(uint _lotteryId, uint _fees) external;

    function getLotteryPoolTypeName(uint _lotteryPoolTypeId) external view returns(bytes32);

    function setStakingAdapter(address _stakingAdapter) external;

    function getFeePercent() external view returns(uint);

    function getWallet() external view returns(address);

    function getMinDaysOpen() external view returns(uint);

    function getStakingAdapter() external view returns(address);

    function pause() external;

    function unpause() external;
    
    function paused() external view returns (bool);

}