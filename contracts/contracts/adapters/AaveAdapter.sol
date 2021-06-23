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
    //function depositETH(address onBehalfOf, uint16 referralCode) external payable;
    function depositETH(address lendingPool, address onBehalfOf, uint16 referralCode) external payable;
    // function withdrawETH(uint256 amount, address onBehalfOf) external;
    function withdrawETH(address lendingPool, uint256 amount, address to) external;
    function getWETHAddress() external view returns (address);
    function getAWETHAddress() external view returns (address);
}

contract AaveAdapter {

    ILendingPoolAddressesProvider provider;
    IWETHGateway wethGateway;

    // Mainnet
    // LendingPoolAddressesProvider - 0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5
    // LendingPool - 0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9

    constructor(address _lendingPoolAddressesProvider, address _wethGateway) {
       //0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5
       provider = ILendingPoolAddressesProvider(_lendingPoolAddressesProvider);
       wethGateway = IWETHGateway(_wethGateway);       
    }

    function depositETH() external payable {
        address lpool = getProvider();
        wethGateway.depositETH{ value: msg.value }(lpool, address(this), 0);
    }

    function withdrawETH(uint _amount) external {
        address lpool = getProvider();
        (uint totalCollateralETH,,,,,) = ILendingPool(lpool).getUserAccountData(address(this));

        address aWeth = address(0x030ba81f1c18d280636f32af80b9aad02cf0854e);
       IERC20(aWeth).approve(address(wethGateway), totalCollateralETH);

        wethGateway.withdrawETH(lpool, totalCollateralETH, address(this));        
    }

    function getUserAccountData() external view returns(uint256, uint256, uint256, uint256, uint256, uint256) {
        
        address lpool = provider.getLendingPool();
        (uint256 totalCollateralETH,
        uint256 totalDebtETH,
        uint256 availableBorrowsETH,
        uint256 currentLiquidationThreshold,
        uint256 ltv,
        uint256 healthFactor
        ) = ILendingPool(lpool).getUserAccountData(address(this));
        return (
            totalCollateralETH,
            totalDebtETH,
            availableBorrowsETH,
            currentLiquidationThreshold,
            ltv,
            healthFactor
        );
    }

    function getTotalCollateralETH() external view returns(uint) {
        
        address lpool = provider.getLendingPool();
        (uint totalCollateralETH,,,,,) = ILendingPool(lpool).getUserAccountData(address(this));
        return totalCollateralETH;
    }

    function getProvider() public view returns(address) {
        address lpool = provider.getLendingPool();
        return(lpool);
    }

    function getWETHAddress() public view returns(address){
        address weth = wethGateway.getWETHAddress();
        return weth;
    }

    function getAWETHBalance() public view returns(uint){
        address aWeth = wethGateway.getAWETHAddress();
        uint balance = IERC20(aWeth).balanceOf(address(this));
        return balance;
    }

    /// @notice Method used to return the contract balance
    /// @return Current contract balance
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

}

