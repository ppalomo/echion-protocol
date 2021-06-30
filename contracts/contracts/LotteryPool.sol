//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/ILotteryPoolFactory.sol";
// import "./LotteryPoolStaking.sol";
import "hardhat/console.sol";

interface ILotteryPoolStaking {
    function depositETH() external payable;
    function withdrawETH(address _to) external returns(uint);
    function getAWETHBalance(address _to) external view returns(uint);
    function getAWETHAddress() external view returns(address);
    function getWETHGateway() external view returns(address);
}

interface IWETHGateway {
    function depositETH(address lendingPool, address onBehalfOf, uint16 referralCode) external payable;
    function withdrawETH(address lendingPool, uint256 amount, address to) external;
    function getWETHAddress() external view returns (address);
}

interface ILendingPool {
    function withdraw(address asset, uint256 amount, address to) external returns (uint256);
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
    ILotteryPoolFactory parent;
    uint public lotteryId;
    uint public ticketPrice;
    uint public minAmount;
    address public creator;
    uint created;
    NFT public nft;
    LotteryStatus public status;
    ILotteryPoolFactory.LotteryPoolType public lotteryPoolType;
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
    event Received(address, uint);

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
        parent = ILotteryPoolFactory(owner());
        lotteryId = _lotteryId;
        lotteryPoolType = ILotteryPoolFactory.LotteryPoolType(_lotteryPoolType);
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
        require(lotteryPoolType == ILotteryPoolFactory.LotteryPoolType.STAKING, 'Tickets can only be redeemed in staking lottery pools');
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
        require(lotteryPoolType == ILotteryPoolFactory.LotteryPoolType.STAKING, 'Lottery pool type is not compatible with staking');
        require(status == LotteryStatus.OPEN, 'The lottery is not open');
        require(block.timestamp >= created + (parent.getMinDaysOpen() * 1 days), 'You must wait the minimum open days');

        // // Approving aWETH spending
        // address lotteryPoolStaking = parent.getLotteryPoolStaking();
        // address aWeth = ILotteryPoolStaking(lotteryPoolStaking).getAWETHAddress();
        // address wethGateway = ILotteryPoolStaking(lotteryPoolStaking).getWETHGateway();        
        // IERC20(aWeth).approve(wethGateway, type(uint256).max);

        // Launching Staking
        address lotteryPoolStaking = parent.getLotteryPoolStaking();
        ILotteryPoolStaking(lotteryPoolStaking).depositETH{ value: address(this).balance }();
    
        status = LotteryStatus.STAKING;
    }

    /// @notice Declares a winner and closes the lottery
    /// @return Winner address
    function declareWinner() external onlyOwner nonReentrant returns (address) {
        require(status != LotteryStatus.CLOSED && status != LotteryStatus.CANCELLED, 'The lottery pool is already closed');
        require(block.timestamp >= created + (parent.getMinDaysOpen() * 1 days), 'You must wait the minimum open days');
        if (lotteryPoolType == ILotteryPoolFactory.LotteryPoolType.STAKING) {
            require(status == LotteryStatus.STAKING, 'The lottery pool is not staking');

            // Approving aWETH spending
            address lotteryPoolStaking = parent.getLotteryPoolStaking();
            address aWeth = ILotteryPoolStaking(lotteryPoolStaking).getAWETHAddress();
            address wethGateway = ILotteryPoolStaking(lotteryPoolStaking).getWETHGateway();
            IERC20(aWeth).approve(wethGateway, type(uint256).max);

            // Recovering staked amount
            // address lotteryPoolStaking = parent.getLotteryPoolStaking();            
            //finalPrice = ILotteryPoolStaking(lotteryPoolStaking).withdrawETH(address(this));
            finalPrice = withdraw();
        }
        require(IERC721(nft.addr).getApproved(nft.index) == address(this), 'Contract is not approved to transfer NFT');        
        
        // Declaring winner
        winner = _calculateWinner();
        status = LotteryStatus.CLOSED;

        if (lotteryPoolType == ILotteryPoolFactory.LotteryPoolType.DIRECT) {
            (finalPrice, fees) = _transferDirectPayments();
        }

        // Transfering NFT prize to winner        
        IERC721(nft.addr).transferFrom(creator, winner, nft.index);
        
        return winner;
    }

    function withdraw() private returns(uint) {
        address addr = address(this);
        address aWeth = address(0x030bA81f1c18d280636F32af80b9AAd02Cf0854e);

        // address lpool = provider.getLendingPool();

        // Approving aWETH spending
        address lotteryPoolStaking = parent.getLotteryPoolStaking();
        address wethGateway = ILotteryPoolStaking(lotteryPoolStaking).getWETHGateway();
        IERC20(aWeth).approve(wethGateway, type(uint256).max);

        // Recovering staked amount
        uint aWethBalance = IERC20(aWeth).balanceOf(addr);
        uint allowance = IERC20(aWeth).allowance(addr, wethGateway);

        if (aWethBalance > 0 && allowance >= aWethBalance) {
            IWETHGateway(wethGateway).withdrawETH(
                address(0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9), 
                aWethBalance, 
                address(this));
        }

        return aWethBalance;
    }

    /// @notice Method used to cancel a lottery
    function cancelLottery() external onlyOwner {
        require(status != LotteryStatus.CLOSED && status != LotteryStatus.CANCELLED, 'The lottery pool is already closed');
        require(minAmount > address(this).balance, 'Cannot cancel lottery. The minimum amount has been reached');
        require(block.timestamp >= created + (parent.getMinDaysOpen() * 1 days), 'You must wait the minimum open days');
    
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

    function getStakingBalance() public view returns (uint) {
        address lotteryPoolStaking = parent.getLotteryPoolStaking();
        address aWeth = ILotteryPoolStaking(lotteryPoolStaking).getAWETHAddress();
        uint amount = IERC20(aWeth).balanceOf(address(this));
        return amount;
    }

    function getStakingAllowance() public view returns (uint) {
        address lotteryPoolStaking = parent.getLotteryPoolStaking();
        address aWeth = ILotteryPoolStaking(lotteryPoolStaking).getAWETHAddress();
        address wethGateway = ILotteryPoolStaking(lotteryPoolStaking).getWETHGateway();
        uint allowance = IERC20(aWeth).allowance(address(this), address(wethGateway));
        return allowance;
    }

    function getFinalPrice() public view returns(uint) {
        return finalPrice;
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

    /**
    */
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

}