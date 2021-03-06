//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "./interfaces/ILotteryPool.sol";
import "./interfaces/IStakingAdapter.sol";
import "./CloneFactory.sol";
import "hardhat/console.sol";

contract LotteryPoolFactory is CloneFactory, OwnableUpgradeable, ReentrancyGuardUpgradeable, PausableUpgradeable {

    // Variables
    ILotteryPool[] public lotteries;
    uint public numberOfActiveLotteries;
    uint public totalSupply;
    uint feePercent;
    address payable wallet;
    uint minDaysOpen;
    address private stakingAdapter;
    mapping(uint => bytes32) private lotteryPoolTypes;
    mapping(uint => address) private masterPools;

    // Events
    event LotteryCreated(uint lotteryId, 
        address creator, 
        address lotteryAddress, 
        address nftAddress, 
        uint nftIndex, 
        uint ticketPrice, 
        uint created, 
        uint lotteryPoolType, 
        uint minAmount, 
        address stakingAdapter, 
        bytes32 stakingAdapterName);
    event LotteryStaked(uint lotteryId, uint stakedAmount);
    event LotteryClosed(uint lotteryId, address winner, uint profit, uint fees);
    event LotteryCancelled(uint lotteryId, uint fees);
    event FeePercentChanged(uint feePercent);
    event WalletChanged(address indexed addr);
    event MinDaysOpenChanged(uint minDaysOpen);

    /// @notice Contract initializer
    /// @param _stakingAdapter - Staking adapter protocol address
    function initialize(address _stakingAdapter) public initializer {
        __Ownable_init();
        __ReentrancyGuard_init();
        __Pausable_init();

        // Initializing variables
        stakingAdapter = _stakingAdapter;
        wallet = payable(owner());
        feePercent = 10; // %
        minDaysOpen = 7;
    }

    // Public methods

    /// @notice Adds a new master lottery pool.
    /// @param _lotteryPoolTypeId - Lottery pool ID
    /// @param _lotteryPoolTypeName - Lottery pool name
    /// @param _masterPoolAddress - Master lottery pool deployed address
    function addMasterPool(
        uint _lotteryPoolTypeId, 
        bytes32 _lotteryPoolTypeName, 
        address _masterPoolAddress
        ) external onlyOwner {

        lotteryPoolTypes[_lotteryPoolTypeId] = _lotteryPoolTypeName;
        masterPools[_lotteryPoolTypeId] = _masterPoolAddress;
    }

    /// @notice Creates a new NFT lottery
    /// @param _nftAddress - NFT contract's address
    /// @param _nftIndex - NFT indentifier in its contract
    /// @param _ticketPrice - Lottery ticket price
    /// @param _minProfit - Minimum creator profit
    /// @param _lotteryPoolType - Lottery pool type
    function createLottery(
        address _nftAddress,
        uint _nftIndex,
        uint _ticketPrice,
        uint _minProfit,
        uint _lotteryPoolType
        ) public whenNotPaused {  

        require(_nftAddress != address(0), 'A valid address is required');
        require(_ticketPrice > 0, 'A valid ticket price is required');

        // Getting master contract address
        address masterPoolAddress = masterPools[_lotteryPoolType];
        require(masterPoolAddress != address(0), 'Master pool contract not deployed');

        // Cloning and deploying lottery pool
        uint created = block.timestamp;
        ILotteryPool lottery = ILotteryPool(createClone(masterPoolAddress));
        lottery.init(
            address(this),
            lotteries.length,
            msg.sender,
            _nftAddress, 
            _nftIndex, 
            _ticketPrice,
            _minProfit,
            created,
            _lotteryPoolType
        );
        lotteries.push(lottery);
        numberOfActiveLotteries++;

        // Getting staking adapter name
        bytes32 stakingAdapterName = IStakingAdapter(stakingAdapter).name();

        // Emiting event
        emit LotteryCreated(lotteries.length - 1, msg.sender, address(lottery), _nftAddress, _nftIndex, _ticketPrice, created, _lotteryPoolType, _minProfit, stakingAdapter, stakingAdapterName);
    }

    /// @notice Increases the total balance
    /// @dev Only can be called by a child Lottery contract
    /// @param _lotteryId Lottery child contract identifier
    /// @param _amount Amount to increase balance
    function increaseTotalSupply(uint _lotteryId, uint _amount) external onlyChild(_lotteryId) {
        totalSupply += _amount;
    }

    /// @notice Decreases the total balance
    /// @dev Only can be called by a child Lottery contract
    /// @param _lotteryId Lottery child contract identifier
    /// @param _amount Amount to decrease balance
    function decreaseTotalSupply(uint _lotteryId, uint _amount) external onlyChild(_lotteryId) {
        totalSupply -= _amount;
    }

    /// @notice Logs a lottery pool staking process
    /// @dev Only can be called by a child Lottery contract
    /// @param _lotteryId - Lottery child contract identifier
    /// @param _stakedAmount - Amount staked
    function lotteryStaked(uint _lotteryId, uint _stakedAmount) external onlyChild(_lotteryId) {
        emit LotteryStaked(_lotteryId, _stakedAmount);
    }

    /// @notice Logs a lottery pool closing
    /// @dev Only can be called by a child Lottery contract
    /// @param _lotteryId - Lottery child contract identifier
    /// @param _winner - Lottery winner address
    /// @param _profit - Creator final profit
    /// @param _fees - Team sent fees
    function lotteryClosed(uint _lotteryId, address _winner, uint _profit, uint _fees) external onlyChild(_lotteryId) {
        numberOfActiveLotteries--;
        emit LotteryClosed(_lotteryId, _winner, _profit, _fees);
    }

    /// @notice Logs a lottery pool cancellation
    /// @dev Only can be called by a child Lottery contract
    /// @param _lotteryId - Lottery child contract identifier
    /// @param _fees - Team sent fees
    function lotteryCancelled(uint _lotteryId, uint _fees) external onlyChild(_lotteryId) {
        numberOfActiveLotteries--;
        emit LotteryCancelled(_lotteryId, _fees);
    }

    /// @notice Returns a lottery pool type name by id
    function getLotteryPoolTypeName(uint _lotteryPoolTypeId) external view returns(bytes32) {
        return lotteryPoolTypes[_lotteryPoolTypeId];
    }

    /// @notice Contract initializer
    /// @param _stakingAdapter - Staking adapter protocol address
    function setStakingAdapter(address _stakingAdapter) external {
        stakingAdapter = _stakingAdapter;
    }

    /// @notice Returns current fee percent
    function getFeePercent() public view returns(uint) {
        return feePercent;
    }

    /// @notice Sets a new fees percent
    /// @param _feePercent New fee percent
    function setFeePercent(uint _feePercent) public onlyOwner {
        feePercent = _feePercent;
        emit FeePercentChanged(feePercent);
    }

    /// @notice Returns the fees wallet where receive the payments
    function getWallet() public view returns(address) {
        return wallet;
    }
    
    /// @notice Sets the fees wallet where receive the payments
    /// @param _addr New address
    function setWallet(address payable _addr) public onlyOwner {
        wallet = _addr;
        emit WalletChanged(wallet);
    }

    /// @notice Returns the minimum days open parameter
    function getMinDaysOpen() public view returns(uint) {
        return minDaysOpen;
    }
    
    /// @notice Sets the minimum days open parameter
    /// @param _minDaysOpen New minimum
    function setMinDaysOpen(uint _minDaysOpen) public onlyOwner {
        minDaysOpen = _minDaysOpen;
        emit MinDaysOpenChanged(minDaysOpen);
    }

    /// @notice Gets the current staking adapter address
    /// @return Staking adapter address
    function getStakingAdapter() external view returns(address) {
        return stakingAdapter;
    }

    /// @notice Triggers stopped state
    function pause() public onlyOwner {
        _pause();
    }

    /// @notice Returns to normal state
    function unpause() public onlyOwner {
        _unpause();
    }

    // Modifiers

    modifier onlyChild(uint _lotteryId) {
        require(msg.sender == address(lotteries[_lotteryId]), 
        'This method must be called through a lottery child contract');
        _;
    }

}