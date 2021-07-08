//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/ILotteryPool.sol";
import "./interfaces/ILotteryPoolFactory.sol";
import "hardhat/console.sol";

abstract contract LotteryPoolBase is ILotteryPool, Ownable, ReentrancyGuard {
    
    // Structs
    struct NFT {
        address addr;
        uint index;
    }

    // Variables
    ILotteryPoolFactory internal parent;
    LotteryPoolType public lotteryPoolType;
    uint public lotteryId;
    uint public ticketPrice;
    uint public minProfit;
    address public creator;
    uint internal created;
    NFT public nft;
    LotteryPoolStatus public status;
    uint public numberOfTickets;
    mapping(address => uint) tickets;    
    address[] public players;
    address public winner; // Lottery winner
    uint public totalSupply;
    uint public stakedAmount; // Amount sent to staking
    uint public profit; // Payment send to creator
    bool private paidToCreator; // Creator is already paid
    uint public fees; // Team fees

    // Events
    event TicketsBought(uint lotteryId, address indexed buyer, uint numberOfTickets, uint amount);
    event TicketsRedeemed(uint lotteryId, address indexed buyer, uint numberOfTickets, uint amount);
    event CreatorPaymentTransfered(address indexed creator, uint paymentToCreator);
    event Received(address addr, uint amount);

    /// @notice Contract constructor method
    /// @param _lotteryId - Lottery unique identifier
    /// @param _creator - Creator address
    /// @param _nftAddress - NFT contract's address
    /// @param _nftIndex - NFT indentifier in its contract
    /// @param _ticketPrice Lottery ticket price
    /// @param _minProfit - Minimum profit amount
    /// @param _created - Creation timestamp
    /// @param _lotteryPoolType - Lottery pool type
    constructor(
        uint _lotteryId,
        address _creator, 
        address _nftAddress, 
        uint _nftIndex, 
        uint _ticketPrice,
        uint _minProfit,
        uint _created,
        LotteryPoolType _lotteryPoolType) {

        parent = ILotteryPoolFactory(owner());
        lotteryId = _lotteryId;
        lotteryPoolType = _lotteryPoolType;
        creator = _creator;
        ticketPrice = _ticketPrice;
        minProfit = _minProfit;
        nft.addr = _nftAddress;
        nft.index = _nftIndex;
        status = LotteryPoolStatus.OPEN;
        created = _created;
        paidToCreator = false;        
    }

    // Public methods

    /// @notice Method used to buy a lottery ticket
    /// @param _numberOfTickets Number of the tickets to buy
    function buyTickets(uint _numberOfTickets) public payable whenParentNotPaused {
        require(status == LotteryPoolStatus.OPEN, 'The lottery pool is not open');
        require(msg.value == ticketPrice * _numberOfTickets, 'Amount sent is different than price');

        // Creating tickets
        tickets[msg.sender] += _numberOfTickets;
        for (uint i=0; i<_numberOfTickets; i++) {
            players.push(msg.sender);
        }
        numberOfTickets += _numberOfTickets;
        totalSupply += msg.value;

        // Increasing total factory balance
        parent.increaseTotalSupply(lotteryId, msg.value);

        // Emiting event
        emit TicketsBought(lotteryId, msg.sender, _numberOfTickets, msg.value);
    }

    /// @notice Method used to redeem bought tickets once the pool is closed
    /// @param _numberOfTickets - Number of the tickets to be cancelled
    function redeemTickets(uint _numberOfTickets) public nonReentrant {
        require(status != LotteryPoolStatus.STAKING, 'Cannot redeem tickets during staking process');
        require(!(lotteryPoolType == LotteryPoolType.STANDARD && status == LotteryPoolStatus.CLOSED), 'Cannot redeem from a standard closed pool');
        require(tickets[msg.sender] > 0 && tickets[msg.sender] >= _numberOfTickets, 'You do not have enough tickets');

        // Calculating amount to redeem
        uint amount = ticketPrice * _numberOfTickets;
        require(totalSupply >= amount, 'Not enough money in the balance');

        // Decreasing number of tickets
        tickets[msg.sender] -= _numberOfTickets;
        numberOfTickets -= _numberOfTickets;
        totalSupply -= amount;

        // Delete items from players array
        uint deleted = 0;
        if (status == LotteryPoolStatus.OPEN) {
            for (uint i=0; i<players.length; i++) {
                if( players[i] == msg.sender && deleted < _numberOfTickets) {         
                    delete players[i];
                    deleted += 1;
                }
            }
        }

        // Decreasing total factory balance
        parent.decreaseTotalSupply(lotteryId, amount);

        // Transfering amount to sender
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");

        // Emiting event
        emit TicketsRedeemed(lotteryId, msg.sender, _numberOfTickets, amount);
    }

    /// @notice Method used to creator can reddem his payment
    /// @dev Only creator can call this function when the pool is closed
    function redeemProfit() external nonReentrant onlyCreator {
        require(status == LotteryPoolStatus.CLOSED, 'The lottery pool is not closed');
        require(profit > 0, 'Nothing to transfer, profit is zero');
        require(!paidToCreator, 'Payment already transfered to creator');

        // Transfering balance to creator
        paidToCreator = true;
        address payable addr = payable(creator);
        (bool success, ) = addr.call{value: profit}("");
        require(success, "Transfer to creator failed");

        emit CreatorPaymentTransfered(msg.sender, profit);
    }

    /// @notice Declares a winner and closes the lottery (virtual)
    function declareWinner() external virtual;

    /// @notice Method used to cancel a lottery
    function cancelLottery() external virtual;

    /// @notice Returns number of tickets for an address
    /// @param _addr Wallet address
    /// @return Number of tickets bought for an address
    function ticketsOf(address _addr) public view returns (uint) {
        return tickets[_addr];
    }

    /// @notice Method used to return the contract balance
    /// @return Current contract balance
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    // @notice Method used to receive ETH
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    // Private methods

    /// @notice Calculating lottery pool winner
    /// @return Winner address  
    function _calculateWinner() internal view returns (address) {        
        uint index = uint(keccak256(abi.encodePacked(block.timestamp, block.difficulty))) % players.length;
        return players[index];
    }

    /// @notice Method used to transfer fees to owner wallet
    function _transferFees() internal {
        if (fees > 0) {
            address payable wallet = payable(parent.getWallet());
            (bool success, ) = wallet.call{value: fees}("");
            require(success, "Transfer fees failed");
        }
    }

    // Modifiers

    modifier whenParentNotPaused {
        require(!parent.paused(), 'Protocol has been paused by security');
        _;
    }

    modifier onlyCreator {
        require(msg.sender == creator, 'Only pool creator can call this method');
        _;
    }

}