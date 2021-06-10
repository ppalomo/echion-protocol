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
    const { isWalletConnected, wallet, network, coin, setTotalBalance, provider } = useStore();
    const lotteryContract = useContractByAddress("LotteryPool", lottery.address);
    const factoryContract = useContract("LotteryPoolFactory");
    const factoryAdminContract = useAdminContract("LotteryPoolFactory");
    const lotteryAdminContract = useAdminContractByAddress("LotteryPool", lottery.address);
    const [numTickets, setNumTickets] = useState(1);
    const [isDepositOpen, setIsDepositOpen] = useState(false);
    const [isCancelTicketOpen, setIsCancelTicketOpen] = useState(false);    
    const [balance, setBalance] = useState(0);
    const [tickets, setTickets] = useState(0);
    const [totalTickets, setTotalTickets] = useState(0);
    const hoverColor = useColorModeValue('gray.100', 'gray.800');
    const [imageURI, setImageURI] = useState(null);
    const [name, setName] = useState(null);
    const [contractName, setContractName] = useState(null);

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
                const [tbal, bal, ttick] = await Promise.all([
                    factoryAdminContract.totalBalance(),
                    lotteryAdminContract.getBalance(),
                    lotteryAdminContract.numberOfTickets()
                ]);
                setTotalBalance(Math.round(utils.formatEther(tbal) * 1e3) / 1e3);
                setBalance(Math.round(utils.formatEther(bal) * 1e3) / 1e3);
                setTotalTickets(ttick);

                if (isWalletConnected)
                {
                    const tick = await lotteryAdminContract.ticketsOf(wallet);
                    setTickets(tick);
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
            console.log("error getLotteryOnChainData: ", error);
            return null;
        }
    }

    function handleOpenDeposit() {
        if (isWalletConnected)
            setIsDepositOpen(true);
    }

    function handleOpenCancelTicket() {
        if (isWalletConnected)
            setIsCancelTicketOpen(true);
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

    async function handleCancelTickets(e) {
        try {
            if(lotteryContract != null) {
                const tx = await lotteryContract.cancelTickets(numTickets);
                await tx.wait();
                fetchData();
            }
        } catch (err) {
            console.log("Error: ", err);
        }
        setIsCancelTicketOpen(false);
    }

    function handleNumTicketsChange(e) {
        setNumTickets(e.target.value);
    }

    async function handleCloseLottery() {
        try {
            if(factoryContract != null) {
                const tx = await factoryContract.declareWinner(lottery.id);
                await tx.wait();
                fetchData();
            }
        } catch (err) {
            console.log("Error: ", err);
        }
    }

    async function handleCancelLottery() {
        try {
            if(factoryContract != null) {
                const tx = await factoryContract.cancelLottery(lottery.id);
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
                    <Link href={network ? `${network.explorerUrl}/address/${lottery.address}` : ""} isExternal>
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
                                    <FaCircle fontSize="15px" color={lottery.lotteryPoolType == "DIRECT" ? "#00C48E" : "#1A94DA" } />
                                    <Text fontSize="0.9rem" fontWeight="500" color="white.100">
                                        { lottery.lotteryPoolType == "DIRECT" ? "Direct" : "Staking" }
                                    </Text>
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
                                        fontSize="0.9rem" 
                                        fontWeight="500" 
                                        color={lottery.status == "CLOSED" ? "#00C48E" : "white.100" }>
                                        { capitalize(lottery.status, true) }
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
                                isDisabled={!isWalletConnected}
                                onClick={() => handleOpenDeposit()}
                                w="33%"
                                fontSize={14}
                                bgColor={buttonColor}
                                variant="outline">
                                Deposit
                            </Button>
                            <Button
                                isDisabled={!isWalletConnected || tickets == 0}
                                onClick={() => handleOpenCancelTicket()}
                                w="33%"
                                fontSize={14}
                                bgColor={buttonColor}
                                variant="outline">
                                Withdraw
                            </Button>
                            <Button
                                isDisabled={true}
                                w="33%"
                                fontSize={14}
                                bgColor={buttonColor}
                                variant="outline">
                                Redeem
                            </Button>
                            </>
                        :
                            <>
                            <Button
                                isDisabled={true}
                                w="33%"
                                fontSize={14}
                                bgColor={buttonColor}
                                variant="outline">
                                Stake
                            </Button>
                            <Button
                                onClick={() => handleCloseLottery()}
                                isDisabled={!isWalletConnected}
                                w="33%"
                                fontSize={14}
                                bgColor={buttonColor}
                                variant="outline">
                                Close
                            </Button>
                            <Button
                                onClick={() => handleCancelLottery()}
                                isDisabled={!isWalletConnected}
                                w="33%"
                                fontSize={14}
                                bgColor={buttonColor}
                                variant="outline">
                                Cancel
                            </Button>
                            </>
                        }

                    </ButtonGroup>
                </Center>

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
                isOpen={isCancelTicketOpen}
                onClose={() => setIsCancelTicketOpen(false)}
                isCentered>
                <ModalOverlay />
                <ModalContent>
                <ModalHeader>Cancel bought tickets</ModalHeader>
                <ModalBody pb={6}>
                    <FormControl>
                        <FormLabel>Tickets amount:</FormLabel>
                        <Input fontSize={14} placeholder="0" value={numTickets} onChange={handleNumTicketsChange} />
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    <Button 
                        onClick={handleCancelTickets}
                        colorScheme="blue" mr={3}>
                        Deposit
                    </Button>
                    <Button onClick={() => setIsCancelTicketOpen(false)}>Cancel</Button>
                </ModalFooter>
                </ModalContent>
            </Modal>
            
        </WrapItem>
            
    );

}
