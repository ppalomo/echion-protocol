import React, { useState, useEffect } from "react";
import { ethers, utils } from 'ethers';
import {
    Center,
    HStack,
    IconButton,
    Image,
    VStack,
    Text,
    Tooltip,
    Wrap,
    useColorModeValue,
    WrapItem,
  } from '@chakra-ui/react';
import {
    useHistory
} from "react-router-dom";
import useStore from '../../store';
import { useContract, useAdminContract } from '../../hooks/contractHooks';
import LotteryItem from '../LotteryItem';
// import { localLotteries } from '../../data/lotteries';
import { FaNetworkWired, FaPlus } from 'react-icons/fa';

const axios = require('axios');

export default function Home (props) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [lotteries, setLotteries] = useState([]);
    const factoryAdminContract = useAdminContract("LotteryPoolFactory");
    const factoryContract = useContract("LotteryPoolFactory");
    const history = useHistory();
    const { isWalletConnected, wallet, network, coin, setPageSelected, numberOfActiveLotteries, totalBalance, setNumberOfActiveLotteries, setTotalBalance } = useStore();
    
    
    // const [numberOfActiveLotteries, setNumberOfActiveLotteries] = useState("0");
    // const [totalBalance, setTotalBalance] = useState("0");

    useEffect(async () => {
        if (factoryAdminContract)
            setIsLoaded(true);
    }, [factoryAdminContract]);

    useEffect(async () => {
        console.log("home - useEffect")
        if (factoryAdminContract)
            await fetchData();
        else {
            setNumberOfActiveLotteries("0");
            setTotalBalance("0");
        }
    }, [isLoaded, wallet, network]);

    async function fetchData() {
        try {
            if(factoryAdminContract != null) {
                const [actives, tbal, lot] = await Promise.all([
                    factoryAdminContract.numberOfActiveLotteries(),
                    factoryAdminContract.totalSupply(),
                    getLotteries()
                ]);
                setNumberOfActiveLotteries(actives.toString());
                const tbalFormatted = Math.round(utils.formatEther(tbal) * 1e3) / 1e3;
                setTotalBalance(tbalFormatted);

                // const kk = await factoryAdminContract.lotteries(0);
                // console.log(kk);
            }
        } catch (err) { 
            console.log("Error: ", err);
        }
    }

    async function getLotteries(){
        setLotteries([]);
        axios.post(`https://api.thegraph.com/subgraphs/name/ppalomo/echion-${network.code}`, {
            query: `
                {
                    lotteryPools(first: 10, orderBy: created, orderDirection: desc) {
                        id
                        address
                        creator
                        status
                        lotteryPoolType
                        nftAddress
                        nftIndex
                        ticketPrice
                        minProfit
                        created
                        stakedAmount
                        winner
                        profit
                        fees
                        stakingAdapter
                        stakingAdapterName
                    }
                }
            `
            })
            .then((res) => {
                setLotteries(res.data.data.lotteryPools);
                return res;
            })
            .catch((error) => {
                console.error(error);
                return [];
            })
    }

    const handleCreateLottery = () => {
        history.push('/new');
        setPageSelected(1);
    };

    return(
        
        <VStack w="100%">

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
                                <Text fontSize="1.5rem" fontWeight="500" color="white.100">{totalBalance}</Text>
                                <Image h={6} src={coin ? coin.image : ""} />
                            </HStack>
                        </VStack>
                        <VStack w="50%" spacing={0}>
                            <Text fontSize="0.9rem" fontWeight="500" color="primary.500">Active Lotteries</Text>
                            <Text fontSize="1.5rem" fontWeight="500" color="white.100">{numberOfActiveLotteries}</Text>
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
                            isDisabled={!isWalletConnected}
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
                    w="100%"
                    mt={{
                        base: "0.5rem",
                        md: "0.5rem",
                        xl: "0.5rem"
                    }}
                    spacing={3}
                    p={0}
                    justify="center"
                    align="center">
                    {lotteries && lotteries.length > 0 ?
                        lotteries.map((l, index) => (
                            <LotteryItem key={index} lottery={l} />
                        ))
                    :
                        <WrapItem>
                            <Text p={3} color={'gray.500'}>
                                No elements. Would you like to create the first lottery?
                            </Text>
                        </WrapItem>
                    }
                </Wrap>
            </Center>

        </VStack>
        
    );

} 
