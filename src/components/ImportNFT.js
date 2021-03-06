import React, {useState, useRef} from "react";
import { ethers, Wallet, utils } from 'ethers';
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
    WrapItem,
    Button,
    FormControl,
    FormLabel,
    Input,
    useColorModeValue
  } from '@chakra-ui/react';
import useStore from '../store';
import ERC721JSON from '../abis/ERC721.json';
import { useContract, useContractByAddress, useAdminContract, useAdminContractByAddress } from '../hooks/contractHooks';

export default function ImportNFT () {
    const [nftAddress, setNFTAddress] = useState("0xE1A19Eb074815e4028768182F8971D222416159A");
    const [nftIndex, setNFTIndex] = useState(0);
    const [ticketPrice, setTicketPrice] = useState(0);
    const [nftImage, setNFTImage] = useState(null);
    const factoryContract = useContract("LotteryPoolFactory");
    const { isWalletConnected, wallet, provider } = useStore();

    async function handleValidateNFT() {
        const response = await getERC721ImageURL(nftAddress, nftIndex);
        if (response && response.success) {
            setNFTImage(response.data);
        } else {
            setNFTImage(null);
        }
    }

    const getERC721ImageURL = async (addr, index) => {
        try {
            //const p = new ethers.providers.JsonRpcProvider(network.rpcUrl);
            const wallet = new Wallet(process.env.REACT_APP_DEPLOYER_PRIVATE_KEY, provider);
            const contract = new ethers.Contract(addr, ERC721JSON.abi, wallet);
            const tokenURI = await contract.tokenURI(index);
            console.log(tokenURI);

            var response = fetch(tokenURI)
                .then(response => {
                    return response.json();
                    // return response.text();
                })
                .then((jsonData) => {
                    return { success: true, data:  jsonData.image}
                })
                .catch((error) => {
                    console.log("catch")
                    console.log(error)
                    console.warn('fetch error:', error);
                    return { success: false, data: error };
                });
            console.log("fin")
            return response;

        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async function handleCreateLottery() {
        console.log("1 - handleCreateLottery");
        try {
            if(factoryContract != null) {
                console.log("2 - factoryContract != null");
                const tx = await factoryContract.createLottery(
                    nftAddress, nftIndex, ethers.utils.parseEther(ticketPrice.toString()), 0, 0);
                await tx.wait();
            }
        } catch (err) {
            console.log("Error: ", err);
        }
    }

    function handleNFTAddressChange(e) {
        setNFTAddress(e.target.value);
    }

    function handleNFTIndexChange(e) {
        setNFTIndex(e.target.value);
    }

    function handleTicketPriceChange(e) {
        setTicketPrice(e.target.value);
    }

    return(
        <VStack
            w="100%"
            p={{
                "base": 5,
                "md": 10,
                "xl": 10
            }}                
            bgColor={useColorModeValue("header.100", "header.900")}
            borderWidth="1px"
            borderColor={useColorModeValue("gray.200", "gray.700")}
            rounded="xl"
            position="relative"
            shadow="lg">

            <Wrap
                w="100%"
                spacing={{
                    "base": 4,
                    "md": 0,
                    "xl": 0
                }}>

                <WrapItem 
                    p={{
                        "base": 0,
                        "md": 2,
                        "xl": 2
                    }}
                    w={{
                        "base": "100%",
                        "md": "80%",
                        "xl": "60%"
                    }}>
                    <FormControl>
                        <FormLabel fontSize={14}>NFT contract:</FormLabel>
                        <Input fontSize={14} placeholder="0x..." value={nftAddress} onChange={handleNFTAddressChange} />
                    </FormControl>
                </WrapItem>

                <WrapItem
                    p={{
                        "base": 0,
                        "md": 2,
                        "xl": 2
                    }}
                    w={{
                        "base": "100%",
                        "md": "20%",
                        "xl": "20%"
                    }}>
                    <FormControl>
                        <FormLabel fontSize={14}>NFT index:</FormLabel>
                        <Input fontSize={14} placeholder="Index" value={nftIndex} onChange={handleNFTIndexChange} />
                    </FormControl>
                </WrapItem>

                <WrapItem
                    p={{
                        "base": 0,
                        "md": 2,
                        "xl": 2
                    }}
                    w={{
                        "base": "100%",
                        "md": "20%",
                        "xl": "20%"
                    }}>
                    <FormControl>
                        <FormLabel fontSize={14}>Ticket price:</FormLabel>
                        <Input fontSize={14} placeholder="Price" value={ticketPrice} onChange={handleTicketPriceChange} />
                    </FormControl>
                </WrapItem>

                <WrapItem
                    alignItems="flex-end"
                    p={{
                        "base": 0,
                        "md": 2,
                        "xl": 2
                    }}
                    w={{
                        "base": "100%",
                        "md": "20%",
                        "xl": "100%"
                    }}>
                    <HStack>
                        <Button
                            isDisabled={!isWalletConnected}
                            onClick={handleValidateNFT}
                            fontSize={14}
                            bgColor={useColorModeValue("gray.300", "gray.700")}
                            variant="outline">
                            Validate
                        </Button>
                        <Button
                            isDisabled={!isWalletConnected}
                            onClick={handleCreateLottery}
                            fontSize={14}
                            bgColor={useColorModeValue("gray.300", "gray.700")}
                            variant="outline">
                            Create
                        </Button>
                    </HStack>
                </WrapItem>

                <WrapItem
                    p={{
                        "base": 0,
                        "md": 0,
                        "xl": 0
                    }}
                    w={{
                        "base": "100%",
                        "md": "100%",
                        "xl": "100%"
                    }}>
                    <Center w="100%" mt={2}>
                        <Image
                            rounded={'xl'}
                            w="100%"
                            objectFit="cover"
                            src={nftImage} />
                    </Center>

                </WrapItem>

            </Wrap>

        </VStack>
    );

} 
