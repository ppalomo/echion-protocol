![alt text](https://github.com/ppalomo/echion-protocol/blob/develop/logo-echion-v1.png?raw=true)

# Echion Protocol

This repository contains the smart contracts source code, frontend and subgraphs for Echion Protocol. The protocol was developed using the following technologies:

- Solidity and Hardhat (Smart Contracts)
- TheGraph (Subgraphs)
- ReactJS and Chakra UI (Frontend)
- EthersJS (Web3)

## What is Echion?

Echion is a protocol for no-loss NFT prize games on Ethereum. Modeled on the well established concept of "no loss lotteries" and "prize savings accounts" the protocol offers a chance to win NFTs in exchange for depositing funds.

![alt text](https://github.com/ppalomo/echion-protocol/blob/develop/screenshot01.jpg?raw=true)

## Lottery Pools

Through Echion's factory contract, a user can create a lottery pool where he can offer an NFT of their own as a prize. Any user with a wallet can buy lottery tickets and choose to win the prize, that is, the NFT.

An NFT owner can create 2 different types of Lottery Pools:

### Standard Lottery Pool

This is a standard lottery process where participants buy tickets and with that money the creator of the NFT will be paid. Participants, therefore, will not be able to get their money back.

### Yield Lottery Pool

In these types of pools, the creator of the NFT will be paid with the yield generated in external protocols such as AAVE or Compound. Participants, therefore, will be able to get their money back once the lottery has concluded.
