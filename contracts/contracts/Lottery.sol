//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

interface ILotteryFactory {
    function increaseTotalBalance(uint _lotteryId, uint _amount) external;
    function decreaseTotalBalance(uint _lotteryId, uint _amount) external;
}

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
  ILotteryFactory parent;
  uint public lotteryId;
  uint public ticketPrice;
  uint created;
  NFT public nft;
  mapping(address => uint) tickets;
  uint public numberOfTickets;
  address[] public players;
  State public state;
  address public winner;

  // Events
  event TicketsBought(uint lotteryId, address indexed buyer, uint numberOfTickets, uint amount);
  event TicketsCancelled(uint lotteryId, address indexed buyer, uint numberOfTickets, uint amount);
  // event WinnerDeclared(address indexed winner, uint prize);

  /**
   @notice Contract constructor method.
   @param _lotteryId - Lottery unique identifier.
   @param _nftAddress - NFT contract's address.
   @param _nftIndex - NFT indentifier in its contract.
   @param _ticketPrice - Lottery ticket price.
   @param _created - Creation timestamp.
   */
  constructor(uint _lotteryId, address _nftAddress, uint _nftIndex, uint _ticketPrice, uint _created) {
    parent = ILotteryFactory(owner());
    lotteryId = _lotteryId;
    ticketPrice = _ticketPrice;
    nft.addr = _nftAddress;
    nft.index = _nftIndex;
    state = State.OPEN;
    created = _created;
    numberOfTickets = 0;
  } 

  /**
   @notice Method used to buy a lottery ticket.
   @param _numberOfTickets - Number of the tickets to buy.
   */
  function buyTickets(uint _numberOfTickets) public payable {
    require(state == State.OPEN, 'The lottery open period was closed');
    require(msg.value == ticketPrice * _numberOfTickets, 'Amount sent is different than price');

    // Creating tickets
    tickets[msg.sender] += _numberOfTickets;
    for (uint i=0; i<_numberOfTickets; i++) {
      players.push(msg.sender);
    }
    numberOfTickets += _numberOfTickets;

    // Increasing total factory balance
    parent.increaseTotalBalance(lotteryId, msg.value);

    emit TicketsBought(lotteryId, msg.sender, _numberOfTickets, msg.value);
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

    emit TicketsCancelled(lotteryId, msg.sender, _numberOfTickets, amount);
  }

  // function redeemTickets() public {
  //   require(state == State.CLOSED, 'The lottery is not closed');

  //   // Tranfering amount to sender
  //   require(address(this).balance >= tickets[msg.sender], 'Not enough money in the balance');
  //   payable(msg.sender).transfer(tickets[msg.sender]);

  //   // Check function !!!!!!!!!!!!!!!!!!!!!!!
  // }

  // /**
  //  @notice Changes de lottery state to staking.
  //  */
  // function launchStaking() external onlyOwner {
  //   require(state == State.OPEN, 'The lottery is not open');
  //   state = State.STAKING;

  //   // Launch staking!!!!!!!!!
  // }

  // /**
  //  @notice Declares a winner and closes the lottery.
  //  */
  // function declareWinner() external onlyOwner {
  //     require(state != State.CLOSED, 'The lottery is not open');
  //     require(players.length > 0, 'At least one player is necessary');

  //     uint index = uint(keccak256(abi.encodePacked(block.timestamp, block.difficulty))) % players.length;
  //     winner = players[index];

  //     // Transfer NFT to winner !!!!!!!!!!!!!!!!!!!!!!!!!!!

  //     state = State.CLOSED;
  // }

  /**
   @notice Returns number of tickets for an address.
   @param _addr - Wallet address.
   */
  function getAddressTickets(address _addr) public view returns (uint) {
    return tickets[_addr];
  }

  /**
    @notice Method used to return the contract balance.
    @return Current contract balance.
    */
  function getBalance() public view returns (uint) {
      return address(this).balance;
  }

}