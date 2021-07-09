//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

/// @title LendingPoolAddressesProvider contract
interface ILendingPoolAddressesProvider {
    function getLendingPool() external view returns (address);
}

/// @title Weth gateway contract
interface IWETHGateway {
    function depositETH(address lendingPool, address onBehalfOf, uint16 referralCode) external payable;
    function withdrawETH(address lendingPool, uint256 amount, address to) external;
}

/// @title Echion Protocol Staking contract
/// @author Pablo Palomo
/// @notice Echion Protocol Staking contract
contract AaveStakingAdapter {

    // Variables
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
    }

    // Public methods

    /// @notice Method used to deposit staking
    function deposit() external payable {
        address lpool = _getProvider();
        wethGateway.depositETH{ value: msg.value }(lpool, msg.sender, 0);
    }

    /// @notice Method used to withdraw deposited staking
    /// @param _data - Needed addresses
    function withdraw(address[5] memory _data) public returns(uint) {
        address pool = ILendingPoolAddressesProvider(_data[0]).getLendingPool();
        uint aWethBalance = IERC20(_data[2]).balanceOf(address(this));
        IWETHGateway(_data[1]).withdrawETH(pool, aWethBalance, address(this));
        return aWethBalance;
    }

    /// @notice Approves deposit withdrawal
    /// @dev Must be called with delegatecall
    /// @return Token address and spender address
    function getApprovalData() external view returns(address, address) {
        return (address(aWeth), address(wethGateway));
    }

    /// @notice Gets needed addresses to call withdraw function
    /// @return lendingPoolAddressesProvider address, wethGateway address and the sWeth token address
    function getWithdrawData() external view returns(address[5] memory) {
        return [address(provider), address(wethGateway), address(aWeth), address(0), address(0)];
    }

    /// @notice Gets staked amount
    function getStakedAmount(address _addr) public view returns (uint) {
        uint amount = aWeth.balanceOf(_addr);
        return amount;
    }

    /// @notice Returns aWETH address allowance
    /// @param _addr - Address parameter
    /// @return Token allowance
    function getAllowance(address _addr) public view returns (uint) {
        uint allowance = aWeth.allowance(_addr, address(wethGateway));
        return allowance;
    }

    // Private methods

    /// @notice Gets provider contract address
    function _getProvider() private view returns(address) {
        address lpool = provider.getLendingPool();
        return(lpool);
    }

}