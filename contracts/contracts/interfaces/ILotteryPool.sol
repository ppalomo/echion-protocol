//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

/// @title LotteryPool interface
interface ILotteryPool {
    enum LotteryPoolType { STANDARD, YIELD }
    enum LotteryPoolStatus { OPEN, STAKING, CLOSED, CANCELLED }
}