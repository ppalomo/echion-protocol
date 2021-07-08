//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

/// @title LotteryPoolFactory interface
interface IStakingAdapter {
    function deposit() external payable;
    function withdraw(address[5] memory _data) external returns(uint);
    function getApprovalData() external returns(address, address);
    function getWithdrawData() external returns(address[5] memory);
    function getStakedAmount(address _addr) external view returns (uint);
    function getAllowance(address _addr) external view returns (uint);
}