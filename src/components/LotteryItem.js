import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    ButtonGroup,
    Center,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    HStack,
    IconButton,
    Image,
    Input,
    Link,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    Tooltip,
    VStack,
    Wrap,
    WrapItem,
    useColorModeValue,
  } from '@chakra-ui/react';
import { ethers, Wallet, utils } from 'ethers';
import { FaUserAstronaut, FaLockOpen, FaLock, FaCircle } from 'react-icons/fa';
import useStore from '../store';
import { truncateRight, truncateMiddle, capitalize } from '../utils/stringsHelper';
import { useContract, useContractByAddress, useAdminContract, useAdminContractByAddress } from '../hooks/contractHooks';
import ERC721JSON from '../abis/ERC721.json';

export default function LotteryItem({lottery}) {
    const buttonColor = useColorModeValue("gray.300", "gray.700");
    const { isWalletConnected, wallet, network, coin, setTotalBalance, provider, signer } = useStore();
    const lotteryContract = useContractByAddress("pools", lottery.lotteryPoolType == "STANDARD" ? "StandardLotteryPool" : "YieldLotteryPool", lottery.address);
    const lotteryAdminContract = useAdminContractByAddress("pools", lottery.lotteryPoolType == "STANDARD" ? "StandardLotteryPool" : "YieldLotteryPool", lottery.address);
    const factoryContract = useContract("LotteryPoolFactory");
    const factoryAdminContract = useAdminContract("LotteryPoolFactory");            
    const [numTickets, setNumTickets] = useState(1);
    const [isDepositOpen, setIsDepositOpen] = useState(false);
    const [isRedeemOpen, setIsRedeemOpen] = useState(false);    
    const [balance, setBalance] = useState(0);
    const [tickets, setTickets] = useState(0);
    const [totalTickets, setTotalTickets] = useState(0);
    const hoverColor = useColorModeValue('gray.100', 'gray.800');
    const [imageURI, setImageURI] = useState(null);
    const [name, setName] = useState(null);
    const [contractName, setContractName] = useState(null);
    const [winner, setWinner] = useState(null);

    useEffect(async () => {
            await fetchData();
    }, [isWalletConnected, wallet]);

    async function fetchData() {
        try {
            if(factoryAdminContract) {
                const response = await getLotteryOnChainData(lottery.nftAddress, lottery.nftIndex);
                if (response && response.success) {
                    setImageURI(response.data.imageURI);
                    setName(response.data.name);
                    setContractName(response.data.contractName);
                } else {
                    console.log("error");
                }
                const [tbal, bal, ttick, win] = await Promise.all([
                    factoryAdminContract.totalSupply(),
                    lottery.status == "STAKING" ? lotteryAdminContract.stakedAmount() : lotteryAdminContract.getBalance(),
                    lotteryAdminContract.numberOfTickets(),
                    lotteryAdminContract.winner()
                ]);
                setTotalBalance(Math.round(utils.formatEther(tbal) * 1e3) / 1e3);
                setBalance(Math.round(utils.formatEther(bal) * 1e3) / 1e3);
                setTotalTickets(ttick);
                setWinner(win);

                if (isWalletConnected)
                {
                    const tick = await lotteryAdminContract.ticketsOf(wallet);
                    setTickets(tick);
                    setNumTickets(tick);
                }
            }
        } catch (error) {
            
        }
    }

    const getLotteryOnChainData = async (addr, index) => {
        try {
            const wallet = new Wallet(process.env.REACT_APP_DEPLOYER_PRIVATE_KEY, provider);
            const contract = new ethers.Contract(addr, ERC721JSON.abi, wallet);

            const contractName = await contract.name();
            const tokenURI = await contract.tokenURI(index);

            var response = fetch(tokenURI)
                .then(response => response.json())
                .then((jsonData) => {
                    const response = { 
                        success: true, 
                        data:  { 
                            name: jsonData.name,
                            contractName: contractName,
                            imageURI: jsonData.image 
                        }
                    };
                    return response;
                })
                .catch((error) => {
                    console.warn('fetch error:', error);
                    return { success: false, data: null };
                });
            return response;

        } catch (error) {
            // console.log("error getLotteryOnChainData: ", error);
            return null;
        }
    }

    function handleOpenDeposit() {
        if (isWalletConnected)
            setIsDepositOpen(true);
    }

    function handleOpenRedeem() {
        if (isWalletConnected)
            setIsRedeemOpen(true);
    }

    async function handleDeposit(e) {
        try {
            if(lotteryContract != null) {  
                const amount = lottery.ticketPrice * numTickets;             
                const tx = await lotteryContract.buyTickets(numTickets, {value: amount.toString()});               
                await tx.wait();
                fetchData();
            }
        } catch (err) {
            console.log("Error: ", err);
        }
        setIsDepositOpen(false);
    }

    async function handleRedeem(e) {
        try {
            if(lotteryContract != null) {
                const tx = await lotteryContract.redeemTickets(numTickets);
                await tx.wait();
                fetchData();
            }
        } catch (err) {
            console.log("Error: ", err);
        }
        setIsRedeemOpen(false);
    }

    function handleNumTicketsChange(e) {
        setNumTickets(e.target.value);
    }

    async function handleStakeLottery() {
        try {
            if(lotteryContract != null) {
                const tx = await lotteryContract.launchStaking();
                await tx.wait();
                fetchData();
            }
        } catch (err) {
            console.log("Error: ", err);
        }
    }

    async function handleCloseLottery() {
        try {
            if(lotteryContract != null) {
                // const wallet = new Wallet(process.env.REACT_APP_DEPLOYER_PRIVATE_KEY, provider);
                const nft = new ethers.Contract(lottery.nftAddress, ERC721JSON.abi, signer);
                let tx = await nft.approve(lottery.address, lottery.nftIndex);
                await tx.wait();

                tx = await lotteryContract.declareWinner();
                await tx.wait();
                fetchData();
            }
        } catch (err) {
            console.log("Error: ", err);
        }
    }

    async function handleCancelLottery() {
        try {
            if(lotteryContract != null) {
                const tx = await lotteryContract.cancelLottery();
                await tx.wait();
                fetchData();
            }
        } catch (err) {
            console.log("Error: ", err);
        }
    }

    async function handleGetProfit() {
        try {
            if(lotteryContract != null) {
                const tx = await lotteryContract.redeemProfit();
                await tx.wait();
                fetchData();
            }
        } catch (err) {
            console.log("Error: ", err);
        }
    }

    return (
        <WrapItem
            p="6"
            w={{
                base: "48%",
                md: "48%",
                xl: "48%"
            }}
            h="auto"
            minW="340px"
            bgColor={useColorModeValue("header.100", "header.900")}
            borderWidth="1px"
            borderColor={useColorModeValue("gray.200", "gray.700")}
            rounded="xl"
            position="relative"
            shadow="lg"
            _hover={
                {
                    bgColor: hoverColor,
                    textDecoration: 'none',
                }
            }>

            <Flex
                flex="1"
                justify="center"
                alignItems="center"
                flexDirection="column">

                <Box pb="4">
                    <Tooltip label={name} fontSize="0.8em" hasArrow bg="gray.300" color="black">
                        <Heading fontSize="xl" fontWeight={500} fontFamily={'body'}>
                            {name ? truncateRight(name ? name: "",28) : "No title"}
                        </Heading>
                    </Tooltip>
                    <Link href={network ? `${network.explorerUrl}/address/${lottery.nftAddress}` : ""} isExternal>
                        <Text color={'gray.500'}>{contractName ? contractName : "No contract name"}</Text>
                    </Link>
                </Box>

                <Center>
                    <Link 
                        isExternal
                        href={imageURI}>
                        <Image 
                            rounded={'xl'}
                            h="230px"
                            objectFit="cover"
                            src={imageURI ? imageURI : 'images/default-no-image.png'} />
                    </Link>
                </Center>
                
                <Center
                    w="100%"
                    mt={5}
                    p={3}
                    bgColor={useColorModeValue("bg.100", "bg.900")}
                    borderWidth="1px"
                    borderColor={useColorModeValue("gray.200", "gray.700")}
                    rounded="xl"
                    position="relative">
                    <Wrap
                        spacing={2} 
                        w="100%">
                        
                        <WrapItem w="30%">
                            <VStack w="100%">
                                <Text fontSize="0.9rem" fontWeight="500" color="primary.500">Ticket Price</Text>
                                <HStack>
                                    <Text fontSize="0.9rem" fontWeight="500" color="white.100">{network ? Math.round(utils.formatEther(lottery.ticketPrice) * 1e3) / 1e3 : "" }</Text>
                                    <Image h={4} src={coin ? coin.image : ""} />
                                </HStack>
                            </VStack>
                        </WrapItem>

                        <WrapItem w="30%">
                            <VStack w="100%">
                                <Text fontSize="0.9rem" fontWeight="500" color="primary.500">Balance</Text>
                                <HStack>
                                    <Text fontSize="0.9rem" fontWeight="500" color="white.100">{network ? balance : "" }</Text>
                                    <Image h={4} src={coin ? coin.image : ""} />
                                </HStack>
                            </VStack>
                        </WrapItem>

                        <WrapItem w="30%">
                            <VStack w="100%">
                                <Text fontSize="0.9rem" fontWeight="500" color="primary.500">Tickets</Text>
                                <HStack>
                                    <Text fontSize="0.9rem" fontWeight="500" color="white.100">{tickets.toString()}/{totalTickets.toString()}</Text>
                                </HStack>
                            </VStack>
                        </WrapItem>

                    </Wrap>
                    
                </Center>

                <Center
                    w="100%"
                    mt={3}
                    p={3}
                    bgColor={useColorModeValue("bg.100", "bg.900")}
                    borderWidth="1px"
                    borderColor={useColorModeValue("gray.200", "gray.700")}
                    rounded="xl"
                    position="relative">
                    <Wrap
                        spacing={2} 
                        w="100%">
                        <WrapItem w="30%">
                            <VStack w="100%">
                                <Text fontSize="0.9rem" fontWeight="500" color="primary.500">Author</Text>
                                <HStack>
                                    <Tooltip label={`Author: ${lottery.address}`} fontSize="0.8em" hasArrow bg="gray.300" color="black">
                                        <Text fontSize="0.9rem" fontWeight="500" color="white.100">
                                            {truncateMiddle(lottery.creator, 11, '...')}
                                        </Text>
                                    </Tooltip>
                                </HStack>
                            </VStack>
                        </WrapItem>
                        <WrapItem w="30%">
                            <VStack w="100%">
                                <Text fontSize="0.9rem" fontWeight="500" color="primary.500">Pool Type</Text>
                                <HStack>
                                    <FaCircle fontSize="15px" color={lottery.lotteryPoolType == "STANDARD" ? "#00C48E" : "#AA00FF" } />
                                    {/* <Tooltip label={`Protocol: ${lottery.stakingAdapterName}`} fontSize="0.8em" hasArrow bg="gray.300" color="black"> */}
                                        <Text fontSize="0.9rem" fontWeight="500" color="white.100">
                                            { lottery.lotteryPoolType == "STANDARD" ? "STD" : "YLD" }
                                        </Text>
                                    {/* </Tooltip> */}
                                </HStack>
                            </VStack>
                        </WrapItem>
                        <WrapItem w="30%">
                            <VStack w="100%">
                                <Text fontSize="0.9rem" fontWeight="500" color="primary.500">Tickets</Text>
                                <HStack>
                                    { lottery.status == "OPEN" ?
                                        <FaLockOpen fontSize="15px" />
                                    :
                                    <FaLock
                                        fontSize="15px"
                                        color={lottery.status == "CLOSED" ? "#00C48E" : "white.100" } />
                                    }
                                    <Text 
                                        fontSize="0.8rem" 
                                        fontWeight="500" 
                                        color={lottery.status == "CLOSED" ? "#00C48E" : lottery.status == "STAKING" ? "#EEA431" : "white.100" }>
                                        { lottery.status }
                                    </Text>
                                </HStack>
                            </VStack>
                        </WrapItem>
                    </Wrap>
                </Center>

                <Center
                    w="100%"
                    mt={4}>
                    <ButtonGroup variant="outline" spacing="2" w="100%">
                        {window.location.pathname == "/" ?
                            <>
                            <Button
                                isDisabled={!isWalletConnected || lottery.status != "OPEN"}
                                onClick={() => handleOpenDeposit() }
                                w="33%"
                                fontSize={14}
                                bgColor={buttonColor}
                                variant="outline">
                                Deposit
                            </Button>
                            {/* <Button
                                isDisabled={!isWalletConnected || tickets == 0}
                                onClick={() => handleOpenCancelTicket()}
                                w="33%"
                                fontSize={14}
                                bgColor={buttonColor}
                                variant="outline">
                                Withdraw
                            </Button> */}
                            <Button
                                onClick={() => handleOpenRedeem()}
                                isDisabled={!isWalletConnected || tickets == 0 || lottery.status == "STAKING"}
                                w="33%"
                                fontSize={14}
                                bgColor={buttonColor}
                                variant="outline">
                                Redeem
                            </Button>
                            </>
                        :
                            <>
                            {lottery.lotteryPoolType == "YIELD" && lottery.status == "OPEN" ? 
                                <Button
                                    visibility="collapse"
                                    onClick={() => handleStakeLottery()}
                                    isDisabled={!isWalletConnected || lottery.status != "OPEN"}
                                    w="33%"
                                    fontSize={14}
                                    bgColor={buttonColor}
                                    variant="outline">
                                    Stake
                                </Button>
                            : ""}
                            {lottery.status == "STAKING" || (lottery.lotteryPoolType == "STANDARD" && lottery.status == "OPEN") ? 
                                <Button
                                    onClick={() => handleCloseLottery()}
                                    isDisabled={!isWalletConnected || ( lottery.lotteryPoolType == "YIELD" && lottery.status != "STAKING") }
                                    w="33%"
                                    fontSize={14}
                                    bgColor={buttonColor}
                                    variant="outline">
                                    Close
                                </Button>
                            : ""}
                            {lottery.status != "CLOSED" ? 
                                <Button
                                    onClick={() => handleCancelLottery()}
                                    isDisabled={!isWalletConnected}
                                    w="33%"
                                    fontSize={14}
                                    bgColor={buttonColor}
                                    variant="outline">
                                    Cancel
                                </Button>
                            : ""}
                            {lottery.status == "CLOSED" ? 
                                <Button
                                    onClick={() => handleGetProfit()}
                                    isDisabled={!isWalletConnected}
                                    w="33%"
                                    fontSize={14}
                                    bgColor={buttonColor}
                                    variant="outline">
                                    Get Profit
                                </Button>
                            : ""}
                            </>
                        }

                    </ButtonGroup>
                </Center>

                {/* <Center>
                    <VStack pt={2}>
                        <Text 
                            fontSize="0.9rem" 
                            fontWeight="500" 
                            color={lottery.status == "CLOSED" ? "#00C48E" : "white.100" }>
                                {"Lottery: " + lottery.address}
                            </Text>
                        <Text 
                            fontSize="0.9rem" 
                            fontWeight="500" 
                            color={lottery.status == "CLOSED" ? "#00C48E" : "white.100" }>
                                {"Winner: " + truncateMiddle(winner, 11, '...')}
                            </Text>
                        <Text 
                            fontSize="0.9rem" 
                            fontWeight="500" 
                            color={lottery.status == "CLOSED" ? "#00C48E" : "white.100" }>
                                {"Protocol: " + lottery.stakingAdapterName}
                            </Text>
                        <Text 
                            fontSize="0.9rem" 
                            fontWeight="500" 
                            color={lottery.status == "CLOSED" ? "#00C48E" : "white.100" }>
                                {"@Protocol: " + lottery.stakingAdapter}
                            </Text>
                        <Text 
                            fontSize="0.9rem" 
                            fontWeight="500" 
                            color={lottery.status == "CLOSED" ? "#00C48E" : "white.100" }>
                                {"Profit: " + lottery.profit}
                            </Text>
                        <Text 
                            fontSize="0.9rem" 
                            fontWeight="500" 
                            color={lottery.status == "CLOSED" ? "#00C48E" : "white.100" }>
                                {"Fees: " + lottery.fees}
                            </Text>
                    </VStack>
                </Center> */}

            </Flex>

            <Modal
                isOpen={isDepositOpen}
                onClose={() => setIsDepositOpen(false)}
                isCentered>
                <ModalOverlay />
                <ModalContent>
                <ModalHeader>Deposit to win</ModalHeader>
                <ModalBody pb={6}>           
                    <VStack>
                        <FormControl>
                            <FormLabel>Tickets amount:</FormLabel>
                            <Input fontSize={14} placeholder="0" value={numTickets} onChange={handleNumTicketsChange} />
                        </FormControl>

                        <HStack pl={2} w="100%">
                            <Text fontSize="1.2rem" fontWeight="500" color="white.100">{network ? Math.round(utils.formatEther((lottery.ticketPrice * numTickets).toString()) * 1e3) / 1e3 : "0" }</Text>
                            <Image h={5} src={coin ? coin.image : ""} />
                        </HStack>
                
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button 
                        onClick={handleDeposit}
                        colorScheme="blue" mr={3}>
                        Deposit
                    </Button>
                    <Button onClick={() => setIsDepositOpen(false)}>Cancel</Button>
                </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal
                isOpen={isRedeemOpen}
                onClose={() => setIsRedeemOpen(false)}
                isCentered>
                <ModalOverlay />
                <ModalContent>
                <ModalHeader>Redeem tickets</ModalHeader>
                <ModalBody pb={6}>
                    <FormControl>
                        <FormLabel>Tickets amount:</FormLabel>
                        <Input fontSize={14} placeholder="0" value={numTickets} onChange={handleNumTicketsChange} />
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    <Button 
                        onClick={handleRedeem}
                        colorScheme="blue" mr={3}>
                        Deposit
                    </Button>
                    <Button onClick={() => setIsRedeemOpen(false)}>Cancel</Button>
                </ModalFooter>
                </ModalContent>
            </Modal>
            
        </WrapItem>
            
    );

}
