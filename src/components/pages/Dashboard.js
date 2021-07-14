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
    const [myLotteries, setMyLotteries] = useState([]);
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
        // console.log("home - useEffect")
        if (factoryAdminContract)
            await fetchData();
        // else {
        //     setNumberOfActiveLotteries("0");
        //     setTotalBalance("0");
        //}
    }, [isLoaded, wallet, network]);

    async function fetchData() {
        try {
            if(factoryAdminContract != null) {
                const [mylot] = await Promise.all([
                    getMyLotteries()
                ]);
                // setNumberOfActiveLotteries(actives.toString());
                // const tbalFormatted = Math.round(utils.formatEther(tbal) * 1e3) / 1e3;
                // setTotalBalance(tbalFormatted);

                // const kk = await factoryAdminContract.lotteries(0);
                // console.log(kk);
            }
        } catch (err) { 
            console.log("Error: ", err);
        }
    }

    async function getMyLotteries(){
        setMyLotteries([]);
        axios.post(`https://api.thegraph.com/subgraphs/name/ppalomo/echion-${network.code}`, {
            query: `
                {
                    lotteryPools(
                        first: 10, 
                        where: { creator: "${wallet}" }, 
                        orderBy: created, orderDirection: desc
                    ) {
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
                setMyLotteries(res.data.data.lotteryPools);
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
        
        <VStack w="100%" mt={10}>                

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
                    {myLotteries && myLotteries.length > 0 ?
                        myLotteries.map((l, index) => (
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
