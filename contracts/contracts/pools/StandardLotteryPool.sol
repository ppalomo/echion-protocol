//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./LotteryPoolBase.sol";

contract StandardLotteryPool is LotteryPoolBase {

    /// @notice Contract constructor method
    constructor() LotteryPoolBase() {
    }

    // Public methods

    /// @notice Contract constructor method
    /// @param _lotteryId - Lottery unique identifier
    /// @param _creator - Creator address
    /// @param _nftAddress - NFT contract's address
    /// @param _nftIndex - NFT indentifier in its contract
    /// @param _ticketPrice Lottery ticket price
    /// @param _minProfit - Minimum profit amount
    /// @param _created - Creation timestamp
    /// @param _lotteryPoolType - Lottery pool type
    function init(
        address _parent,
        uint _lotteryId,
        address _creator, 
        address _nftAddress, 
        uint _nftIndex, 
        uint _ticketPrice,
        uint _minProfit,
        uint _created,
        uint _lotteryPoolType) external {
        
        _init(_parent, _lotteryId, _creator, _nftAddress, _nftIndex, _ticketPrice, _minProfit, _created, _lotteryPoolType);
    }

    /// @notice Declares a winner and closes the lottery
    function declareWinner() external override onlyCreator nonReentrant whenParentNotPaused {
        require(winner == address(0), 'A winner has already been declared');
        require(status == LotteryPoolStatus.OPEN, 'The lottery pool is already closed');
        require(block.timestamp >= created + (parent.getMinDaysOpen() * 1 days), 'You must wait the minimum open days');
        require(IERC721(nft.addr).getApproved(nft.index) == address(this), 'Contract is not approved to transfer NFT');
        
        // Declaring winner
        winner = _calculateWinner();
        status = LotteryPoolStatus.CLOSED;

        // Calculating payment and transfering fees
        uint feePercent = parent.getFeePercent();                
        profit = totalSupply - (totalSupply * feePercent / 100);
        fees = (totalSupply * feePercent / 100) + (address(this).balance - totalSupply);

        // Transfering fees to owner wallet
        _transferFees();

        // Transfering NFT prize to winner        
        IERC721(nft.addr).transferFrom(creator, winner, nft.index);

        // Logging pool closing
        parent.lotteryClosed(lotteryId, winner, profit, fees);
    }

    /// @notice Method used to cancel a lottery
    function cancelLottery() external override onlyCreator nonReentrant {
        require(status == LotteryPoolStatus.OPEN, 'The lottery pool is already closed');
        require(minProfit > totalSupply, 'Cannot cancel lottery. The minimum amount has been reached');
        require(block.timestamp >= created + (parent.getMinDaysOpen() * 1 days), 'You must wait the minimum open days');

        // Cancelling lottery
        status = LotteryPoolStatus.CANCELLED;
        
        // Logging pool cancellation        
        parent.lotteryCancelled(lotteryId, fees);
    }

    /// @notice Method used to redeem bought tickets once the pool is closed
    /// @param _numberOfTickets - Number of the tickets to be cancelled
    function redeemTickets(uint _numberOfTickets) public nonReentrant {
        require(status == LotteryPoolStatus.OPEN, 'Cannot redeem from a standard closed pool');        
        require(tickets[msg.sender] > 0 && tickets[msg.sender] >= _numberOfTickets, 'You do not have enough tickets');

        _redeemTickets(_numberOfTickets, msg.sender);
    }

}