//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./LotteryPool.sol";
import "hardhat/console.sol";


/// @title Echion lotteries factory contract
/// @author Pablo Palomo
/// @notice Contract used for maintaining the list of lotteries and interact with them
contract LotteryPoolFactory is Ownable, ReentrancyGuard {

    // Enums
    enum LotteryPoolType
    { 
        DIRECT,
        STAKING
    }

    // Variables
    address lotteryPoolStaking;
    LotteryPool[] public lotteries;
    uint public numberOfActiveLotteries;
    uint public totalBalance;
    uint feePercent;
    address payable wallet;
    uint minDaysOpen; 

    // Events
    event LotteryCreated(uint lotteryId, address creator, address lotteryAddress, address nftAddress, uint nftIndex, uint ticketPrice, uint created, LotteryPoolType lotteryPoolType, uint minAmount);
    event LotteryStaked(uint lotteryId);
    event LotteryClosed(uint lotteryId, address winner, uint paymentToCreator, uint fees);
    event LotteryCancelled(uint lotteryId, uint paymentToCreator);
    event FeePercentChanged(uint feePercent);
    event WalletChanged(address indexed addr);
    event MinDaysOpenChanged(uint minDaysOpen);

    /// @notice Contract constructor method
    constructor(address _lotteryPoolStaking) {
        lotteryPoolStaking = _lotteryPoolStaking;
        wallet = payable(owner());
        feePercent = 10; // %
        numberOfActiveLotteries = 0;
        totalBalance = 0;
        minDaysOpen = 7;
    }

    /// @notice Creates a new NFT lottery
    /// @param _nftAddress NFT contract's address
    /// @param _nftIndex NFT indentifier in its contract
    /// @param _ticketPrice Lottery ticket price
    /// @param _lotteryPoolType Lottery pool type
    function createLottery(address _nftAddress, uint _nftIndex, uint _ticketPrice, LotteryPoolType _lotteryPoolType, uint _minAmount) public {
        require(_nftAddress != address(0), 'A valid address is required');
        require(_ticketPrice > 0, 'A valid ticket price is required');
        require(IERC721(_nftAddress).isApprovedForAll(msg.sender, address(this)), 'Contract is not approved to transfer NFT');

        // Creating new lottery pool
        uint created = block.timestamp;
        LotteryPool instance = new LotteryPool(
            lotteries.length, 
            uint(_lotteryPoolType),            
            msg.sender, 
            _nftAddress, 
            _nftIndex, 
            _ticketPrice,
            _minAmount,
            created);
        lotteries.push(instance);
        numberOfActiveLotteries++;

        // Emiting event
        emit LotteryCreated(lotteries.length - 1, msg.sender, address(instance), _nftAddress, _nftIndex, _ticketPrice, created, _lotteryPoolType, _minAmount);
    }

    /// @notice Changes de lottery state to staking.
    /// @param _lotteryId - Lottery identifier.
    function launchStaking(uint _lotteryId) public {
        LotteryPool lottery = lotteries[_lotteryId];
        require(lottery.status() == LotteryPool.LotteryStatus.OPEN, 'The lottery is not open');
        require(uint(lottery.lotteryPoolType()) == uint(LotteryPoolType.STAKING), 'Lottery pool type is not compatible with staking');
        require(lottery.creator() == msg.sender, 'You are not the owner of the lottery');

        // Launching lottery staking process
        lottery.launchStaking();

        // Emiting event
        emit LotteryStaked(_lotteryId);
    }

    /// @notice Declares a winner and closes the lottery
    /// @param _lotteryId - Lottery identifier
    function declareWinner(uint _lotteryId) public nonReentrant {
        LotteryPool lottery = lotteries[_lotteryId];
        require(lottery.creator() == msg.sender, 'You are not the owner of the lottery');
        require(lottery.status() != LotteryPool.LotteryStatus.CLOSED && lottery.status() != LotteryPool.LotteryStatus.CANCELLED, 
            'The lottery pool is already closed');
        if (lottery.lotteryPoolType() == ILotteryPoolFactory.LotteryPoolType.STAKING) {
            require(lottery.status() == LotteryPool.LotteryStatus.STAKING, 'The lottery pool is not staking');
        }

        // Check approval to transfer NFT
        (address nftAddress, uint nftIndex) = lottery.nft();
        require(IERC721(nftAddress).isApprovedForAll(msg.sender, address(this)), 'Contract is not approved to transfer NFT');
        IERC721(nftAddress).approve(address(lottery), nftIndex);
        
        // Launching winner declaration process
        address winner = lottery.declareWinner();
        uint paymentToCreator = lottery.getPaymentToCreator();
        uint fees = lottery.fees();
        numberOfActiveLotteries--;

        // Emiting event
        emit LotteryClosed(_lotteryId, winner, paymentToCreator, fees);
    }

    /// @notice Method used to cancel a lottery pool
    /// @param _lotteryId - Lottery identifier
    function cancelLottery(uint _lotteryId) public {
        LotteryPool lottery = lotteries[_lotteryId];
        require(lottery.creator() == msg.sender, 'You are not the owner of the lottery');
        require(lottery.status() != LotteryPool.LotteryStatus.CLOSED && lottery.status() != LotteryPool.LotteryStatus.CANCELLED, 
            'The lottery pool is already closed');
        require(lottery.minAmount() > lottery.getBalance(), 'Cannot cancel lottery. The minimum amount has been reached');
        
        // Cancelling lottery pool
        lottery.cancelLottery();
        uint paymentToCreator = lottery.getPaymentToCreator();
        numberOfActiveLotteries--;

        // Emiting event
        emit LotteryCancelled(_lotteryId, paymentToCreator);
    }

    /// @notice Increases the total balance
    /// @dev Only can be called by a child Lottery contract
    /// @param _lotteryId Lottery child contract identifier
    /// @param _amount Amount to increase balance
    function increaseTotalBalance(uint _lotteryId, uint _amount) public {
        require(msg.sender == address(lotteries[_lotteryId]), 'This method must be called through a lottery child contract');
        totalBalance += _amount;
    }

    /// @notice Decreases the total balance
    /// @dev Only can be called by a child Lottery contract
    /// @param _lotteryId Lottery child contract identifier
    /// @param _amount Amount to decrease balance
    function decreaseTotalBalance(uint _lotteryId, uint _amount) public {
        require(msg.sender == address(lotteries[_lotteryId]), 'This method must be called through a lottery child contract');
        totalBalance -= _amount;
    }

    /// @notice Returns fee percent
    function getFeePercent() public view returns(uint) {
        return feePercent;
    }

    /// @notice Sets fees percent
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

    /// @notice Sets the minimum days open parameter
    function getLotteryPoolStaking() external view returns(address) {
        return lotteryPoolStaking;
    }

}