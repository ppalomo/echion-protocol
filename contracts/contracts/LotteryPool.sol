//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "hardhat/console.sol";

/// @title LotteryFactory interface
interface ILotteryFactory {
    enum LotteryPoolType { DIRECT, STAKING }
    function increaseTotalBalance(uint _lotteryId, uint _amount) external;
    function decreaseTotalBalance(uint _lotteryId, uint _amount) external;
    function getFeePercent() external returns(uint);
    function getWallet() external returns(address);
}

/// @title Echion Protocol Staking Lottery Pool contract
/// @author Pablo Palomo
/// @notice Lottery contract base.
contract LotteryPool is ReentrancyGuard, Ownable {

    // Enums
    enum LotteryStatus
    { 
        OPEN,
        STAKING,
        CLOSED,
        CANCELLED
    }

    // Structs
    struct NFT {
        address addr;
        uint index;
    }

    // Variables
    ILotteryFactory parent;
    uint public lotteryId;
    uint public ticketPrice;
    uint public minAmount;
    address public creator;
    uint created;
    NFT public nft;
    LotteryStatus public status;
    ILotteryFactory.LotteryPoolType public lotteryPoolType;
    uint public numberOfTickets;
    mapping(address => uint) tickets;    
    address[] public players;
    address public winner;
    uint public finalPrice;
    uint public fees;

    // Events
    event TicketsBought(uint lotteryId, address indexed buyer, uint numberOfTickets, uint amount);
    event TicketsCancelled(uint lotteryId, address indexed buyer, uint numberOfTickets, uint amount);
    event TicketsRedeemed(uint lotteryId, address indexed buyer, uint numberOfTickets, uint amount);

    /// @notice Contract constructor method
    /// @param _lotteryId Lottery unique identifier
    /// @param _creator Creator address
    /// @param _nftAddress NFT contract's address
    /// @param _nftIndex NFT indentifier in its contract
    /// @param _ticketPrice Lottery ticket price
    /// @param _created Creation timestamp
    constructor(
        uint _lotteryId,
        uint _lotteryPoolType,
        address _creator, 
        address _nftAddress, 
        uint _nftIndex, 
        uint _ticketPrice,
        uint _minAmount,
        uint _created
    ) {
        parent = ILotteryFactory(owner());
        lotteryId = _lotteryId;
        lotteryPoolType = ILotteryFactory.LotteryPoolType(_lotteryPoolType);
        creator = _creator;
        ticketPrice = _ticketPrice;
        minAmount = _minAmount;
        nft.addr = _nftAddress;
        nft.index = _nftIndex;
        status = LotteryStatus.OPEN;
        created = _created;
        numberOfTickets = 0;
        finalPrice = 0;
        fees = 0;
    }

    /// @notice Method used to buy a lottery ticket
    /// @param _numberOfTickets Number of the tickets to buy
    function buyTickets(uint _numberOfTickets) public payable {
        require(status == LotteryStatus.OPEN, 'The lottery pool is not open');
        require(msg.value == ticketPrice * _numberOfTickets, 'Amount sent is different than price');

        // Creating tickets
        tickets[msg.sender] += _numberOfTickets;
        for (uint i=0; i<_numberOfTickets; i++) {
            players.push(msg.sender);
        }
        numberOfTickets += _numberOfTickets;

        // Increasing total factory balance
        parent.increaseTotalBalance(lotteryId, msg.value);

        // Emiting event
        emit TicketsBought(lotteryId, msg.sender, _numberOfTickets, msg.value);
    }

    /// @notice Method used to cancel bought tickets
    /// @param _numberOfTickets - Number of the tickets to be cancelled
    function cancelTickets(uint _numberOfTickets) public nonReentrant {
        require(status == LotteryStatus.OPEN, 'The lottery pool is not open');
        require(tickets[msg.sender] >= _numberOfTickets, 'You do not have enough tickets');

        // Tranfering amount to sender
        uint amount = ticketPrice * _numberOfTickets;
        require(address(this).balance >= amount, 'Not enough money in the balance');
        payable(msg.sender).transfer(amount);

        tickets[msg.sender] -= _numberOfTickets;
        numberOfTickets -= _numberOfTickets;

        // Delete items from players array
        uint deleted = 0;
        for (uint i=0; i<players.length; i++) {
            if( players[i] == msg.sender && deleted < _numberOfTickets) {         
                delete players[i];
                deleted += 1;
            }
        }

        // Decreasing total factory balance
        parent.decreaseTotalBalance(lotteryId, amount);

        // Emiting event
        emit TicketsCancelled(lotteryId, msg.sender, _numberOfTickets, amount);
    }

    /// @notice Method used to redeem bought tickets once the pool is closed
    function redeemTickets() public nonReentrant {
        require(lotteryPoolType == ILotteryFactory.LotteryPoolType.STAKING, 'Tickets can only be redeemed in staking lottery pools');
        require(status == LotteryStatus.CLOSED || status == LotteryStatus.CANCELLED, 'The lottery pool is not closed');
        
        // Tranfering amount to sender
        uint numTickets = tickets[msg.sender];
        uint amount = ticketPrice * numTickets;
        require(address(this).balance >= amount, 'Not enough money in the balance');

        // Updating tickets quantity        
        tickets[msg.sender] = 0;
        numberOfTickets -= numTickets;

        // Decreasing total factory balance
        parent.decreaseTotalBalance(lotteryId, amount);

        // Transfering amount to sender
        payable(msg.sender).transfer(amount);

        // Emiting event
        emit TicketsRedeemed(lotteryId, msg.sender, numTickets, amount);
    }

    /// @notice Changes de lottery state to staking
    function launchStaking() external onlyOwner {
        require(lotteryPoolType == ILotteryFactory.LotteryPoolType.STAKING, 'Lottery pool type is not compatible with staking');
        require(status == LotteryStatus.OPEN, 'The lottery is not open');

        // Launch staking!!!!!!!!!
    
        status = LotteryStatus.STAKING;
    }

    /// @notice Declares a winner and closes the lottery
    /// @return Winner address
    function declareWinner() external onlyOwner nonReentrant returns (address) {
        require(status != LotteryStatus.CLOSED && status != LotteryStatus.CANCELLED, 'The lottery pool is already closed');
        if (lotteryPoolType == ILotteryFactory.LotteryPoolType.STAKING) {
            require(status == LotteryStatus.STAKING, 'The lottery pool is not staking');
        }

        status = LotteryStatus.CLOSED;
        
        // Declaring winner
        winner = _calculateWinner();

        if (lotteryPoolType == ILotteryFactory.LotteryPoolType.DIRECT) {
            (finalPrice, fees) = _transferDirectPayments();
        }

        // Transfer NFT to winner
        // _transferPrizeToWinner(); !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        
        return winner;
    }

    /// @notice Method used to cancel a lottery
    function cancelLottery() external onlyOwner {
        require(status != LotteryStatus.CLOSED && status != LotteryStatus.CANCELLED, 'The lottery pool is already closed');
        require(minAmount > address(this).balance, 'Cannot cancel lottery. The minimum amount has been reached');
    
        // If staking!!!
        // Recover balance in staking!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        
        finalPrice = address(this).balance;
        status = LotteryStatus.CANCELLED;
    }

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

    /// @notice Calculating lottery pool winner
    /// @return Winner address  
    function _calculateWinner() private view returns (address) {        
        uint index = uint(keccak256(abi.encodePacked(block.timestamp, block.difficulty))) % players.length;
        return players[index];
    }

    /// @notice Method used to transfer fees and payment if it's a direct lottery pool
    /// @return Payment amount sent to creator and fees
    function _transferDirectPayments() private returns (uint, uint) {
        // Calculating payment and transfering fees
        uint fee = address(this).balance * parent.getFeePercent() / 100;
        uint payment = address(this).balance - fee;
        
        // Transfering fees to owner wallet
        address payable wallet = payable(parent.getWallet());
        wallet.transfer(fee);

        // Transfering balance to creator
        address payable addr = payable(creator);
        addr.transfer(payment);

        return (payment, fee);
    }

    // /// @notice Transfer NFT to winner
    // function _transferPrizeToWinner() private {
        //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // }

}