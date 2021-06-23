//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

interface ILendingPoolAddressesProvider {
    function getLendingPool() external view returns (address);
}

interface ILendingPool {
    function deposit(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external;
    function deposit(address asset, address onBehalfOf, uint16 referralCode) external payable;
    function withdraw(address asset, uint256 amount, address to) external returns (uint256);
    function getUserAccountData(address user)
    external
    view
    returns (
      uint256 totalCollateralETH,
      uint256 totalDebtETH,
      uint256 availableBorrowsETH,
      uint256 currentLiquidationThreshold,
      uint256 ltv,
      uint256 healthFactor
    );
}

interface IWETHGateway {
    function depositETH(address lendingPool, address onBehalfOf, uint16 referralCode) external payable;
    function withdrawETH(address lendingPool, uint256 amount, address to) external;
    function getWETHAddress() external view returns (address);
}

contract LotteryPoolStaking {

    ILendingPoolAddressesProvider provider;
    IWETHGateway wethGateway;
    IERC20 aWeth;

    constructor(address _lendingPoolAddressesProvider, address _wethGateway, address _aWethAddress) {
        provider = ILendingPoolAddressesProvider(_lendingPoolAddressesProvider);
        wethGateway = IWETHGateway(_wethGateway);
        aWeth = IERC20(_aWethAddress);

        // Approving aWETH spending
        IERC20(aWeth).approve(address(wethGateway), type(uint256).max);
    }

    function depositETH() external payable {
        address lpool = _getProvider();
        wethGateway.depositETH{ value: msg.value }(lpool, msg.sender, 0);
    }

    function withdrawETH() external {
        address lpool = _getProvider();        
        uint aWethBalance = getAWETHBalance();

        // Approving aWETH spending
        aWeth.approve(address(wethGateway), aWethBalance);

        wethGateway.withdrawETH(lpool, aWethBalance, msg.sender);
        //wethGateway.withdrawETH(lpool, type(uint256).max, address(this));

    }

    // function getUserAccountData() external view returns(uint256, uint256, uint256, uint256, uint256, uint256) {
        
    //     address lpool = provider.getLendingPool();
    //     (uint256 totalCollateralETH,
    //     uint256 totalDebtETH,
    //     uint256 availableBorrowsETH,
    //     uint256 currentLiquidationThreshold,
    //     uint256 ltv,
    //     uint256 healthFactor
    //     ) = ILendingPool(lpool).getUserAccountData(address(this));
    //     return (
    //         totalCollateralETH,
    //         totalDebtETH,
    //         availableBorrowsETH,
    //         currentLiquidationThreshold,
    //         ltv,
    //         healthFactor
    //     );
    // }

    // function getTotalCollateralETH() external view returns(uint) {
        
    //     address lpool = provider.getLendingPool();
    //     (uint totalCollateralETH,,,,,) = ILendingPool(lpool).getUserAccountData(address(this));
    //     return totalCollateralETH;
    // }

    function _getProvider() private view returns(address) {
        address lpool = provider.getLendingPool();
        return(lpool);
    }

    // function getWETHAddress() public view returns(address){
    //     address weth = wethGateway.getWETHAddress();
    //     return weth;
    // }

    function getAWETHBalance() public view returns(uint){
        return aWeth.balanceOf(msg.sender);
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    function getAWETHAllowance() public view returns (uint) {
        uint allowance = aWeth.allowance(address(this), address(wethGateway));
        return allowance;
    }

}

