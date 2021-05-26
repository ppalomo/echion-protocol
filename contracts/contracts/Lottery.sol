//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract Lottery is Ownable {
  
  // Enums
  enum State
  { 
    OPEN, 
    STAKING, 
    CLOSED 
  }

  // Structs
  struct NFT {
    address addr;
    uint index;
  }

  // Variables
  uint public lotteryId;
  uint public ticketPrice;
  uint created;
  NFT public nft;
  mapping(address => uint) tickets;
  address[] public players;
  State public state;
  address public winner;

  // Events
  event TicketsBought(uint lotteryId, address indexed buyer, uint numberOfTickets);
  // event WinnerDeclared(address indexed winner, uint prize);

  /**
   @notice Contract constructor method.
   @param _lotteryId - Lottery unique identifier.
   @param _nftAddress - NFT contract's address.
   @param _nftIndex - NFT indentifier in its contract.
   @param _ticketPrice - Lottery ticket price.
   */
  constructor(uint _lotteryId, address _nftAddress, uint _nftIndex, uint _ticketPrice) {
    lotteryId = _lotteryId;
    ticketPrice = _ticketPrice;
    nft.addr = _nftAddress;
    nft.index = _nftIndex;
    state = State.OPEN;
    created = block.timestamp;
  } 

  /**
   @notice Method used to buy a lottery ticket.
   @param _numberOfTickets - Number of the tickets to buy.
   */
  function buyTickets(uint _numberOfTickets) public payable {
    require(state == State.OPEN, 'The lottery open period was closed');
    require(msg.value == ticketPrice * _numberOfTickets, 'Amount sent is different than price');

    tickets[msg.sender] += _numberOfTickets;
    for (uint i=0; i<_numberOfTickets; i++) {
      players.push(msg.sender);
    }

    emit TicketsBought(lotteryId, msg.sender, _numberOfTickets);
  }

  /**
   @notice Method used to cancel bought tickets.
   @param _numberOfTickets - Number of the tickets to buy.
   */
  function cancelTickets(uint _numberOfTickets) public {
    require(state == State.OPEN, 'The lottery open period was closed');
    require(tickets[msg.sender] >= _numberOfTickets, 'You do not have enough tickets');

    // Tranfering amount to sender
    uint amount = ticketPrice * _numberOfTickets;
    require(address(this).balance >= amount, 'Not enough money in the balance');
    payable(msg.sender).transfer(amount);

    tickets[msg.sender] -= _numberOfTickets;

    // Delete items from players array
  }

  function redeemTickets() public {
    require(state == State.CLOSED, 'The lottery is not closed');

    // Tranfering amount to sender
    require(address(this).balance >= tickets[msg.sender], 'Not enough money in the balance');
    payable(msg.sender).transfer(tickets[msg.sender]);

    // Check function !!!!!!!!!!!!!!!!!!!!!!!
  }

  /**
   @notice Changes de lottery state to staking.
   */
  function launchStaking() external onlyOwner {
    require(state == State.OPEN, 'The lottery is not open');
    state = State.STAKING;

    // Launch staking!!!!!!!!!
  }

  /**
   @notice Declares a winner and closes the lottery.
   */
  function declareWinner() external onlyOwner {
      require(state != State.CLOSED, 'The lottery is not open');
      require(players.length > 0, 'At least one player is necessary');

      uint index = uint(keccak256(abi.encodePacked(block.timestamp, block.difficulty))) % players.length;
      winner = players[index];

      // Transfer NFT to winner !!!!!!!!!!!!!!!!!!!!!!!!!!!

      state = State.CLOSED;
  }

  /**
   @notice Returns number of tickets for an address.
   @param _addr - Wallet address.
   */
  function getAddressTickets(address _addr) public view returns (uint) {
    return tickets[_addr];
  }

  /**
   @notice Returns total number of tickets.
   */
  function getTotalTickets() public view returns (uint) {
    return players.length;
  }

  /**
    @notice Method used to return the contract balance.
    @return Current contract balance.
    */
  function getBalance() public view returns (uint) {
      return address(this).balance;
  }

}