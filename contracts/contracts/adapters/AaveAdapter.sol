//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import {ILendingPool} from "@aave/protocol-v2/contracts/interfaces/ILendingPool.sol";

contract AaveAdapter {

    constructor() {
    }

    function deposit(address pool, address token, address user, uint256 amount) {
        //ILendingPool(pool).deposit(token, amount, user, '0');
        //{...}
    }
}

