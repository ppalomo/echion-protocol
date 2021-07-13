//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

/// @title ETH gateway contract
interface ICEther {
    function mint() external payable;
    function redeem(uint redeemTokens) external returns (uint);
    function approve(address spender, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function balanceOf(address owner) external view returns (uint256);
    function balanceOfUnderlying(address owner) external returns (uint);
    function getAccountSnapshot(address account) external view returns (uint, uint, uint, uint);
}

/// @title Echion Protocol Compound Staking contract
/// @author Pablo Palomo
/// @notice Echion Protocol Staking contract
contract CompoundStakingAdapter {

    // Variables
    ICEther cEther;

    /// @notice Contract constructor method
    constructor(address _cEthAddress) {
        cEther = ICEther(_cEthAddress);
    }

    // Public methods

    /// @notice Method used to deposit staking
    /// @dev Must be called with delegatecall
    /// @param _data - Needed addresses
    function deposit(address[5] memory _data) external {
        ICEther(_data[0]).mint{ value: address(this).balance }();
    }

    /// @notice Method used to withdraw deposited staking
    /// @dev Must be called with delegatecall
    /// @param _data - Needed addresses
    function withdraw(address[5] memory _data) public returns(uint) {
        uint cEthBalance = ICEther(_data[0]).balanceOf(address(this));
        ICEther(_data[0]).redeem(cEthBalance);
        return cEthBalance;
    }

    /// @notice Approves deposit withdrawal
    /// @dev Must be called with delegatecall
    /// @return Token address and spender address
    function getApprovalData() external view returns(address, address) {
        return (address(cEther), address(cEther));
    }

    /// @notice Gets needed addresses to call withdraw function
    /// @return lendingPoolAddressesProvider address, wethGateway address and the sWeth token address
    function getWithdrawData() external view returns(address[5] memory) {
        return [address(cEther), address(0), address(0), address(0), address(0)];
    }

    /// @notice Gets staked amount
    function getStakedAmount(address _addr) public view returns (uint) {
        uint amount = cEther.balanceOf(_addr);
        return amount;
    }

    /// @notice Returns aWETH address allowance
    /// @param _addr - Address parameter
    /// @return Token allowance
    function getAllowance(address _addr) public view returns (uint) {
        uint allowance = cEther.allowance(_addr, address(cEther));
        return allowance;
    }

    /// @notice Staking protocol name
    function name() external pure returns(bytes32) {
        return 'COMPOUND';
    }

}