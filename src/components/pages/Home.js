import React, { useState, useEffect } from "react";
import { ethers } from 'ethers';
import {
    Center,
    HStack,
    IconButton,
    Image,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    VStack,
    Text,
    Tooltip,
    Wrap,
    Button,
    FormControl,
    FormLabel,
    Input,
    useColorModeValue,
  } from '@chakra-ui/react';
import {
    useHistory
} from "react-router-dom";
import useStore from '../../store';
import { useContract, useAdminContract } from '../../hooks/contractHooks';
import LotteryItem from '../LotteryItem';
import { lotteries } from '../../data/lotteries';
import { FaPlus } from 'react-icons/fa';

export default function Home (props) {
    const history = useHistory();
    const { isWalletConnected, coin, setPageSelected } = useStore();
    const factoryAdminContract = useAdminContract("LotteryFactory");
    const factoryContract = useContract("LotteryFactory");
    const [numberOfActiveLotteries, setNumberOfActiveLotteries] = useState("0");
    const [maxActiveLotteries, setMaxActiveLotteries] = useState("0");

    useEffect(async () => {
        if (factoryAdminContract)
            await fetchData();
        else {
            setNumberOfActiveLotteries("0");
            setMaxActiveLotteries("0");
        }
    }, [factoryAdminContract]);

    async function fetchData() {
        try {
            if(factoryAdminContract != null) {
                const [actives, max] = await Promise.all([
                    factoryAdminContract.numberOfActiveLotteries(),
                    factoryAdminContract.maxActiveLotteries(),
                ]);
                setNumberOfActiveLotteries(actives.toString());
                setMaxActiveLotteries(max.toString());
            }
        } catch (err) {
            console.log("Error: ", err);
        }   
    }

    const handleCreateLottery = () => {
        history.push('/new');
        setPageSelected(1);
    };

    return(
        
        <VStack>

            <HStack
                w={{
                    base: "90%",
                    md: "80%",
                    xl: "50%"
                }}
                mt={{
                    base: "1.5rem",
                    md: "2rem",
                    xl: "2rem"
                }}>

                <Center
                    minHeight="100px"
                    w="80%"
                    bgColor={useColorModeValue("header.100", "header.900")}
                    borderWidth="1px"
                    borderColor={useColorModeValue("gray.200", "gray.700")}
                    rounded="xl"
                    position="relative"
                    shadow="lg">
                    <HStack
                        spacing={0} 
                        w="100%">
                        <VStack w="50%" spacing={0}>
                            <Text fontSize="0.9rem" fontWeight="500" color="primary.500">Total Value Locked</Text>
                            <HStack>
                                <Text fontSize="1.5rem" fontWeight="500" color="white.100">23.40</Text>
                                <Image h={6} src={coin ? coin.image : ""} />
                            </HStack>
                        </VStack>
                        <VStack w="50%" spacing={0}>
                            <Text fontSize="0.9rem" fontWeight="500" color="primary.500">Active Lotteries</Text>
                            <Text fontSize="1.5rem" fontWeight="500" color="white.100">{numberOfActiveLotteries}/{maxActiveLotteries}</Text>
                        </VStack>
                    </HStack>
                </Center>

                <Center
                    minHeight="100px"
                    w="20%"
                    bgColor={useColorModeValue("header.100", "header.900")}
                    borderWidth="1px"
                    borderColor={useColorModeValue("gray.200", "gray.700")}
                    rounded="xl"
                    position="relative"
                    shadow="lg">
                    <Tooltip label="Create new lottery" fontSize="0.8em" hasArrow bg="gray.300" color="black">
                        <IconButton
                            onClick={handleCreateLottery}
                            // isDisabled={!isWalletConnected}
                            w="33%"
                            fontSize={14}
                            bgColor={useColorModeValue("gray.300", "gray.700")}
                            variant="outline"
                            icon={<FaPlus />}
                            />
                    </Tooltip>
                </Center>

            </HStack>

            <Center
                w={{
                    base: "90%",
                    md: "80%",
                    xl: "50%"
                }}>
                <Wrap 
                    mt={{
                        base: "0.5rem",
                        md: "0.5rem",
                        xl: "0.5rem"
                    }}
                    spacing={3}
                    p={0}
                    justify="center"
                    align="center">
                    {lotteries.map((l, index) => (
                        <LotteryItem key={index} lottery={l} />
                    ))}
                </Wrap>
            </Center>

        </VStack>
        
    );

} 
