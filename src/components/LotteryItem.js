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
    Image,
    Input,
    Link,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    Tooltip,
    VStack,
    WrapItem,
    useColorModeValue,
    useDisclosure,
  } from '@chakra-ui/react';
import { ethers, utils } from 'ethers';
import useStore from '../store';
import { truncateRight } from '../utils/stringsHelper';
import { useContractByAddress, useAdminContract, useAdminContractByAddress } from '../hooks/contractHooks';

export default function LotteryItem({lottery}) {
    const lotteryContract = useContractByAddress("Lottery", lottery.address);
    const factoryAdminContract = useAdminContract("LotteryFactory");    
    const lotteryAdminContract = useAdminContractByAddress("Lottery", lottery.address);
    const [numTickets, setNumTickets] = useState(1);
    const [isDepositOpen, setIsDepositOpen] = useState(false);
    const [isCancelTicketOpen, setIsCancelTicketOpen] = useState(false);    
    const { isWalletConnected, wallet, network, coin, setTotalBalance } = useStore();
    const [balance, setBalance] = useState(0);
    const [tickets, setTickets] = useState(0);
    const [totalTickets, setTotalTickets] = useState(0);
    const hoverColor = useColorModeValue('gray.100', 'gray.800');

    useEffect(async () => {
        if (factoryAdminContract)
            await fetchData();
        else {
            setTotalBalance(0);
            setBalance(0);
            setTickets(0);
            setTotalTickets(0);
        }
    }, [isWalletConnected]);

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
                const amount = lottery.price * numTickets;
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

    async function fetchData() {
        try {
            if(factoryAdminContract) {
                const [tbal, bal, ttick, tick] = await Promise.all([
                    factoryAdminContract.totalBalance(),
                    lotteryAdminContract.getBalance(),
                    lotteryAdminContract.numberOfTickets(),
                    lotteryAdminContract.getAddressTickets(wallet)
                ]);
                const tbalFormatted = Math.round(utils.formatEther(tbal) * 1e3) / 1e3;
                setTotalBalance(tbalFormatted);
                const balFormatted = Math.round(utils.formatEther(bal) * 1e3) / 1e3;
                setBalance(balFormatted);
                setTotalTickets(ttick);
                setTickets(tick);
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

                <Center>
                    <Link 
                        isExternal
                        href={lottery.nft.imageURI}>
                        <Image                        
                            rounded={'xl'}
                            h="230px"
                            objectFit="cover"
                            src={lottery.nft.imageURI} />
                    </Link>
                </Center>

                <Box pt="6">
                    <Tooltip label={lottery.nft.name} fontSize="0.8em" hasArrow bg="gray.300" color="black">
                        <Heading fontSize="xl" fontWeight={500} fontFamily={'body'}>
                            {truncateRight(lottery.nft.name,28)}
                        </Heading>
                    </Tooltip>
                    <Link href={network ? `${network.explorerUrl}/${lottery.address}` : ""} isExternal>
                        <Text color={'gray.500'}>{lottery.nft.tokenName}</Text>
                    </Link>
                </Box>

                <Center
                    w="100%"
                    mt={3}
                    p={3}
                    bgColor={useColorModeValue("bg.100", "bg.900")}
                    borderWidth="1px"
                    borderColor={useColorModeValue("gray.200", "gray.700")}
                    rounded="xl"
                    position="relative">
                    <HStack
                        spacing={5} 
                        w="100%">
                        <VStack w="33%">
                            <Text fontSize="0.9rem" fontWeight="500" color="primary.500">Ticket Price</Text>
                            <HStack>
                                <Text fontSize="0.9rem" fontWeight="500" color="white.100">{network ? Math.round(utils.formatEther(lottery.price) * 1e3) / 1e3 : "" }</Text>
                                <Image h={4} src={coin ? coin.image : ""} />
                            </HStack>
                        </VStack>
                        <VStack w="33%">
                            <Text fontSize="0.9rem" fontWeight="500" color="primary.500">Balance</Text>
                            <HStack>
                                {/* <Text fontSize="0.9rem" fontWeight="500" color="white.100">{network ? Math.round(utils.formatEther(lottery.balance) * 1e3) / 1e3 : "" }</Text> */}
                                <Text fontSize="0.9rem" fontWeight="500" color="white.100">{network ? balance : "" }</Text>
                                <Image h={4} src={coin ? coin.image : ""} />
                            </HStack>
                        </VStack>
                        <VStack w="33%">
                            <Text fontSize="0.9rem" fontWeight="500" color="primary.500">Tickets</Text>
                            <HStack>
                                <Text fontSize="0.9rem" fontWeight="500" color="white.100">{tickets.toString()}/{totalTickets.toString()}</Text>
                            </HStack>
                        </VStack>
                    </HStack>
                </Center>

                <Center
                    w="100%"
                    mt={4}>
                    <ButtonGroup variant="outline" spacing="2" w="100%">
                        <Button
                            isDisabled={!isWalletConnected}
                            onClick={() => handleOpenDeposit()}
                            w="33%"
                            fontSize={14}
                            bgColor={useColorModeValue("gray.300", "gray.700")}
                            variant="outline">
                            Deposit
                        </Button>
                        <Button
                            isDisabled={!isWalletConnected || tickets == 0}
                            onClick={() => handleOpenCancelTicket()}
                            w="33%"
                            fontSize={14}
                            bgColor={useColorModeValue("gray.300", "gray.700")}
                            variant="outline">
                            Withdraw
                        </Button>
                        <Button
                            isDisabled={true}
                            w="33%"
                            fontSize={14}
                            bgColor={useColorModeValue("gray.300", "gray.700")}
                            variant="outline">
                            Redeem
                        </Button>
                    </ButtonGroup>
                </Center>

                {/* <h1>{lottery.address}</h1> */}

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
                            <Text fontSize="1.2rem" fontWeight="500" color="white.100">{network ? Math.round(utils.formatEther((lottery.price * numTickets).toString()) * 1e3) / 1e3 : "0" }</Text>
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
