//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

// /// @title LendingPoolAddressesProvider contract
// interface ILendingPoolAddressesProvider {
//     function getLendingPool() external view returns (address);
// }

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

/// @title Echion Protocol Staking contract
/// @author Pablo Palomo
/// @notice Echion Protocol Staking contract
contract CompoundStakingAdapter {

    // Variables
    ICEther cEther;
    // IWETHGateway wethGateway;

    // /// @notice Contract constructor method
    // /// @param _lendingPoolAddressesProvider - Lending pool addresses provider AAVE
    // /// @param _wethGateway - WETH Gateway address
    // /// @param _aWethAddress - aWETH contract's address
    // constructor(address _lendingPoolAddressesProvider, address _wethGateway, address _aWethAddress) {
    //     provider = ILendingPoolAddressesProvider(_lendingPoolAddressesProvider);
    //     wethGateway = IWETHGateway(_wethGateway);
    //     aWeth = IERC20(_aWethAddress);
    // }

    /// @notice Contract constructor method
    constructor(address _cEthAddress) {
        cEther = ICEther(_cEthAddress);
    }

    // Public methods

    /// @notice Method used to deposit staking
    function deposit() external payable {
        cEther.mint{ value: msg.value }();
        // require(cEther.mint{ value: msg.value }() == 0, "Deposit failed");
    }

    // /// @notice Method used to deposit staking
    // /// @dev Must be called with delegatecall
    // function deposit(address[5] memory _data) external payable {
    //     ICEther(_data[0]).mint{ value: msg.value }();
    //     // require(cEther.mint{ value: msg.value }() == 0, "Deposit failed");
    // }

    /// @notice Method used to withdraw deposited staking
    /// @dev Must be called with delegatecall
    /// @param _data - Needed addresses
    function withdraw(address[5] memory _data) public returns(uint) {
        // address pool = ILendingPoolAddressesProvider(_data[0]).getLendingPool();
        uint cEthBalance = ICEther(_data[0]).balanceOf(address(this));
        uint amount = ICEther(_data[0]).redeem(cEthBalance);
        // IWETHGateway(_data[1]).withdrawETH(pool, aWethBalance, address(this));
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
        // return [address(provider), address(wethGateway), address(aWeth), address(0), address(0)];
        return [address(cEther), address(0), address(0), address(0), address(0)];
    }

    /// @notice Gets staked amount
    function getStakedAmount(address _addr) public view returns (uint) {
        console.log("aaaaaaaaaaaaaaaaaaaaaaaa");
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

    function kk() public view returns(uint) {
        return address(this).balance;
    }

    // Private methods

    // /// @notice Gets provider contract address
    // function _getProvider() private view returns(address) {
    //     address lpool = provider.getLendingPool();
    //     return(lpool);
    // }

}




// pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import "hardhat/console.sol";

// // /// @title LendingPoolAddressesProvider contract
// // interface ILendingPoolAddressesProvider {
// //     function getLendingPool() external view returns (address);
// // }

// /// @title ETH gateway contract
// interface ICEther {
//     function mint() external payable;
//     function redeem(uint redeemTokens) external returns (uint);
// }

// /// @title Echion Protocol Staking contract
// /// @author Pablo Palomo
// /// @notice Echion Protocol Staking contract
// contract CompoundStakingAdapter {

//     // Variables
//     ICEther cEther;
//     // IWETHGateway wethGateway;
//     IERC20 cEth;

//     // /// @notice Contract constructor method
//     // /// @param _lendingPoolAddressesProvider - Lending pool addresses provider AAVE
//     // /// @param _wethGateway - WETH Gateway address
//     // /// @param _aWethAddress - aWETH contract's address
//     // constructor(address _lendingPoolAddressesProvider, address _wethGateway, address _aWethAddress) {
//     //     provider = ILendingPoolAddressesProvider(_lendingPoolAddressesProvider);
//     //     wethGateway = IWETHGateway(_wethGateway);
//     //     aWeth = IERC20(_aWethAddress);
//     // }

//     /// @notice Contract constructor method
//     constructor(address _cEtherGateway, address _cEthAddress) {
//         cEther = ICEther(_cEtherGateway);
//         cEth = IERC20(_cEthAddress);
//     }

//     // Public methods

//     /// @notice Method used to deposit staking
//     function deposit() external payable {
//         cEther.mint{ value: msg.value }();
//         // require(cEther.mint{ value: msg.value }() == 0, "Deposit failed");
//     }

//     /// @notice Method used to withdraw deposited staking
//     /// @param _data - Needed addresses
//     function withdraw(address[5] memory _data) public returns(uint) {
//         // address pool = ILendingPoolAddressesProvider(_data[0]).getLendingPool();
//         uint cEthBalance = IERC20(_data[0]).balanceOf(address(this));
//         uint amount = cEther.redeem(cEthBalance);
//         // IWETHGateway(_data[1]).withdrawETH(pool, aWethBalance, address(this));
//         return cEthBalance;
//     }

//     /// @notice Approves deposit withdrawal
//     /// @dev Must be called with delegatecall
//     /// @return Token address and spender address
//     function getApprovalData() external view returns(address, address) {
//         return (address(cEth), address(0));
//     }

//     /// @notice Gets needed addresses to call withdraw function
//     /// @return lendingPoolAddressesProvider address, wethGateway address and the sWeth token address
//     function getWithdrawData() external view returns(address[5] memory) {
//         // return [address(provider), address(wethGateway), address(aWeth), address(0), address(0)];
//         return [address(cEth), address(0), address(0), address(0), address(0)];
//     }

//     /// @notice Gets staked amount
//     function getStakedAmount(address _addr) public view returns (uint) {
//         uint amount = cEth.balanceOf(_addr);
//         return amount;
//     }

//     /// @notice Returns aWETH address allowance
//     /// @param _addr - Address parameter
//     /// @return Token allowance
//     function getAllowance(address _addr) public view returns (uint) {
//         // uint allowance = aWeth.allowance(_addr, address(wethGateway));
//         // return allowance;
//         return 0;
//     }

//     // Private methods

//     // /// @notice Gets provider contract address
//     // function _getProvider() private view returns(address) {
//     //     address lpool = provider.getLendingPool();
//     //     return(lpool);
//     // }

// }