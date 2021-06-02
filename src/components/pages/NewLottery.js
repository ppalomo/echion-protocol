import React, {useState} from "react";
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
    useColorModeValue,
  } from '@chakra-ui/react';
import {
    useHistory
} from "react-router-dom";
import useStore from '../../store';
import ERC721JSON from '../../abis/ERC721.json';
import { useContract, useAdminContract } from '../../hooks/contractHooks';

export default function NewLottery () {
    const { network, provider, isWalletConnected } = useStore();
    const factoryContract = useContract("LotteryFactory");
    const [nftAddress, setNFTAddress] = useState("0xE1A19Eb074815e4028768182F8971D222416159A");
    const [nftIndex, setNFTIndex] = useState(0);
    const [ticketPrice, setTicketPrice] = useState(0);
    const [nftImage, setNFTImage] = useState(null);

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
                .then(response => response.json())
                .then((jsonData) => {
                    // console.log(jsonData.image);
                    // return jsonData.image;
                    return { success: true, data:  jsonData.image}
                })
                .catch((error) => {
                    console.warn('fetch error:', error);
                    return { success: false, data: error };
                });
            return response;

        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async function handelCreateLottery() {
        try {
            if(factoryContract != null) {
                // utils.parseEther(ticketPrice.toString())
                // const tx = await factoryContract.createLottery(nftAddress, nftIndex, ethers.utils.parseEther('0.1'));
                const tx = await factoryContract.createLottery(nftAddress, nftIndex, ethers.utils.parseEther(ticketPrice.toString()));                
                await tx.wait();
                const kk = await factoryContract.maxActiveLotteries();
                console.log(kk);
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
            spacing={7}
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

            <Text 
                bgGradient="linear(to-l, #7928CA,#FF0080)"
                bgClip="text"
                fontSize={{
                    "base": "2xl",
                    "md": "3xl",
                    "xl": "3xl"
                }}
                fontWeight="extrabold">
                Create new NFT lottery
            </Text>

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
                                onClick={handelCreateLottery}
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
                        {/* <Center w="100%" mt={2}>
                            <Image
                                rounded={'xl'}
                                w="100%"
                                objectFit="cover"
                                src="https://lh3.googleusercontent.com/g2k-3oCz6vUm2fzbASRZbyWl5SrdYd9MBp0XmQ3508Nvp_VO8WeZqjXy_ACrajKjIjxSilXCx7vfSCs6exFIGIfVctuhzVXp6_f-PXg=s0" />
                        </Center> */}
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

        </VStack>

       
    );

} 
