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
import { utils } from 'ethers';
import useStore from '../store';
import { truncateRight } from '../utils/stringsHelper';

export default function LotteryItem({lottery}) {
    // const { isDepositOpen, onDepositOpen, onDepositClose } = useDisclosure();
    const [isDepositOpen, setIsDepositOpen] = useState(false);
    const { isWalletConnected, network, coin } = useStore();
    const hoverColor = useColorModeValue('gray.100', 'gray.800');

    function handleOpenDeposit() {

        if (isWalletConnected)
            setIsDepositOpen(true);
    }

    async function handleDeposit(e) {
        //console.log(e);
        // var kk = await getMaxActiveLotteries();
        // console.log(kk.toString());
        setIsDepositOpen(false);
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
                    <Text color={'gray.500'}>{lottery.nft.tokenName}</Text>
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
                                <Text fontSize="0.9rem" fontWeight="500" color="white.100">{network ? Math.round(utils.formatEther(lottery.balance) * 1e3) / 1e3 : "" }</Text>
                                <Image h={4} src={coin ? coin.image : ""} />
                            </HStack>
                        </VStack>
                        <VStack w="33%">
                            <Text fontSize="0.9rem" fontWeight="500" color="primary.500">Tickets</Text>
                            <HStack>
                                <Text fontSize="0.9rem" fontWeight="500" color="white.100">{lottery.tickets}</Text>
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
                            isDisabled={true}
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

            </Flex>

            <Modal
                isOpen={isDepositOpen}
                onClose={() => setIsDepositOpen(false)}
                isCentered>
                <ModalOverlay />
                <ModalContent>
                <ModalHeader>Deposit to win</ModalHeader>
                <ModalBody pb={6}>
                    <FormControl>
                        <FormLabel>Tickets amount:</FormLabel>
                        <Input placeholder="1" />
                    </FormControl>
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
            
        </WrapItem>
            
    );

}
