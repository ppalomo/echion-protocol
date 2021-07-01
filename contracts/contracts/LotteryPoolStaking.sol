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

/// @title Echion Protocol Staking contract
/// @author Pablo Palomo
/// @notice Echion Protocol Staking contract
contract LotteryPoolStaking {

    ILendingPoolAddressesProvider provider;
    IWETHGateway wethGateway;
    IERC20 aWeth;

    /// @notice Contract constructor method
    /// @param _lendingPoolAddressesProvider - Lending pool addresses provider AAVE
    /// @param _wethGateway - WETH Gateway address
    /// @param _aWethAddress - aWETH contract's address
    constructor(address _lendingPoolAddressesProvider, address _wethGateway, address _aWethAddress) {
        provider = ILendingPoolAddressesProvider(_lendingPoolAddressesProvider);
        wethGateway = IWETHGateway(_wethGateway);
        aWeth = IERC20(_aWethAddress);

        // Approving aWETH spending
        IERC20(aWeth).approve(address(wethGateway), type(uint256).max);
    }

    /// @notice Method used to deposit staking
    function depositETH() external payable {
        address lpool = _getProvider();
        wethGateway.depositETH{ value: msg.value }(lpool, msg.sender, 0);
    }

    /// @notice Method used to withdraw deposited staking
    /// @param _lendingPoolAddressesProvider - Lending pool addresses provider AAVE
    /// @param _wethGateway - WETH Gateway address
    /// @param _aWethAddress - aWETH contract's address
    function withdrawETH(address _lendingPoolAddressesProvider, address _wethGateway, address _aWethAddress) public returns(uint) {
        address pool = ILendingPoolAddressesProvider(_lendingPoolAddressesProvider).getLendingPool();
        uint aWethBalance = IERC20(_aWethAddress).balanceOf(address(this));
        IWETHGateway(_wethGateway).withdrawETH(pool, aWethBalance, address(this));
        return aWethBalance;
    }

    /// @notice Method used to retrieve AAVE's addresses to integrate with
    function getAddresses() external view returns(address, address, address) {
        return (
            address(provider),
            address(wethGateway),
            address(aWeth)
        );
    }

    /// @notice Returns aWETH address balance
    /// @param _addr - Address parameter
    /// @return Token balance
    function getAWETHBalance(address _addr) public view returns(uint){
        return aWeth.balanceOf(_addr);
    }

    /// @notice Returns aWETH address allowance
    /// @param _addr - Address parameter
    /// @return Token allowance
    function getAWETHAllowance(address _addr) public view returns (uint) {
        uint allowance = aWeth.allowance(_addr, address(wethGateway));
        return allowance;
    }

    /// @notice Get AAVE's user account data
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

    /// @notice Gets provider contract address
    function _getProvider() private view returns(address) {
        address lpool = provider.getLendingPool();
        return(lpool);
    }

}