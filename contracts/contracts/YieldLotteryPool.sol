//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IStakingAdapter.sol";
import "./LotteryPoolBase.sol";

contract YieldLotteryPool is LotteryPoolBase {

    // Variables
    IStakingAdapter private stakingAdapter;
    
    // Events
    event StakingWithdrawal(uint withdrawal);

    // Public methods

    /// @notice Contract constructor method
    constructor() LotteryPoolBase() {}

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

        // Initializing variables
        address stakingAdapterAddress = parent.getStakingAdapter();
        stakingAdapter = IStakingAdapter(stakingAdapterAddress);
    }

    /// @notice Changes de lottery state to staking
    function launchStaking() external onlyCreator {
        require(totalSupply > 0, 'Balance must be greater than 0');
        require(status == LotteryPoolStatus.OPEN, 'The lottery is not open');
        require(block.timestamp >= created + (parent.getMinDaysOpen() * 1 days), 'You must wait the minimum open days');

        // Staking balance
        _depositStaking();

        // Changing pool status
        status = LotteryPoolStatus.STAKING;
        parent.lotteryStaked(lotteryId, stakedAmount);
        console.log("here I am");
    }

    /// @notice Declares a winner and closes the lottery
    function declareWinner() external override onlyCreator nonReentrant whenParentNotPaused {
        require(winner == address(0), 'A winner has already been declared');
        require(status == LotteryPoolStatus.STAKING, 'The lottery pool is not in staking phase');
        require(block.timestamp >= created + (parent.getMinDaysOpen() * 1 days), 'You must wait the minimum open days');
        require(IERC721(nft.addr).getApproved(nft.index) == address(this), 'Contract is not approved to transfer NFT');

        // Recovering staked amount
        _withdrawStaking();
        
        if (address(this).balance > 0) {
            // Declaring winner
            winner = _calculateWinner();
            status = LotteryPoolStatus.CLOSED;

            // Calculating payment and transfering fees
            uint feePercent = parent.getFeePercent();
            uint yield = address(this).balance - stakedAmount;
            fees = (yield * feePercent / 100) + (stakedAmount - totalSupply);
            profit = yield - (yield * feePercent / 100);

            // Transfering fees to owner wallet
            _transferFees();

            // Transfering NFT prize to winner        
            IERC721(nft.addr).transferFrom(creator, winner, nft.index);

            // Logging pool closing
            parent.lotteryClosed(lotteryId, winner, profit, fees);
        }        
    }

    /// @notice Method used to cancel a lottery
    function cancelLottery() external override onlyCreator nonReentrant {
        require(status != LotteryPoolStatus.CLOSED && status != LotteryPoolStatus.CANCELLED, 'The lottery pool is already closed');
        require(minProfit > totalSupply, 'Cannot cancel lottery. The minimum amount has been reached');
        require(block.timestamp >= created + (parent.getMinDaysOpen() * 1 days), 'You must wait the minimum open days');

        // Cancelling lottery
        status = LotteryPoolStatus.CANCELLED;

        // Recovering staking amount
        if (status == LotteryPoolStatus.STAKING) {
            _withdrawStaking();
        }

        if (address(this).balance > 0) {
            // Calculating payment and transfering fees
            fees = address(this).balance - totalSupply;

            // Transfering fees to owner wallet
            _transferFees();
        }
            
        // Logging pool cancellation        
        parent.lotteryCancelled(lotteryId, profit);
    }
    
    /// @notice Method used to redeem bought tickets once the pool is closed
    /// @param _numberOfTickets - Number of the tickets to be cancelled
    function redeemTickets(uint _numberOfTickets) public nonReentrant {
        require(status != LotteryPoolStatus.STAKING, 'Cannot redeem tickets during staking process');
        require(tickets[msg.sender] > 0 && tickets[msg.sender] >= _numberOfTickets, 'You do not have enough tickets');

        _redeemTickets(_numberOfTickets, msg.sender);
    } 

    // Private methods

    /// @notice Method used to deposit staking
    function _depositStaking() private {
        // Must approve to spend tokens to be able to withdraw deposit later on
        (address token, address spender) = stakingAdapter.getApprovalData();
        IERC20(token).approve(spender, type(uint256).max);

        // Launching Staking
        stakedAmount = address(this).balance;
        stakingAdapter.deposit{ value: address(this).balance }();
    }

    /// @notice Method used to withdraw staked amount
    function _withdrawStaking() private {
        address[5] memory data = stakingAdapter.getWithdrawData();
        (bool success, bytes memory result) = address(stakingAdapter).delegatecall(
            abi.encodeWithSignature("withdraw(address[5])", data)
        );
        require(success, "Staking withdraw failed");

        uint withdrawal = abi.decode(result, (uint256));
        emit StakingWithdrawal(withdrawal);
    }

}