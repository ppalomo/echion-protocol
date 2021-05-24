//#region [Imports]

import React, {useState, useEffect} from "react";
import {
    Button,
    ButtonGroup,
    Center,
    Flex,
    HStack,
    IconButton,
    Image,
    Link,
    Text,
    VStack,
    useColorMode,
    useColorModeValue,
    ReachLink
  } from '@chakra-ui/react';
import { ethers, utils, BigNumber } from 'ethers';
import { FaDiscord, FaMoon, FaSun, FaTwitter } from 'react-icons/fa';
import { truncate } from '../utils/stringsHelper';
import TopMenu from './TopMenu';
import useStore from '../store';

//#endregion

export default function Header (props) {
    // const [balance, setBalance] = useState(null);
    const { colorMode, toggleColorMode } = useColorMode();
    const { isWalletConnected, wallet, balance, setBalance, signer, network, toggleWalletModal, toggleNetworkModal, networkModalIsOpen } = useStore();
    const borderColor = useColorModeValue("border.100", "border.900");
    const textColor = useColorModeValue("text.100", "text.900");
    const addressBg = useColorModeValue("border.100", "border.900");

    useEffect(async () => {
        if (isWalletConnected) {
            await getWalletBalance();
        }            
    }, [isWalletConnected]);

    async function getWalletBalance() {
        if (signer != null) {
            const b = await signer.getBalance();
            setBalance(b);
        }
    }

    return(
        <Flex
            as="header"
            w="100%"
            h="5rem"
            m="0 auto"
            position="sticky"
            alignItems="center"
            justifyContent="space-between"
            px={['0.5rem', '0.5rem', '1.5rem']}
            bgColor={useColorModeValue("header.100", "header.900")}
            borderBottom="1px"
            borderColor={borderColor}>

            <Link href="/">
                <Image src={useColorModeValue("images/logo-light.png", "images/logo-dark.png")} w="200px" objectFit="cover" />
            </Link>

            <ButtonGroup variant="ghost" color="gray.600" mr="1rem">

                <TopMenu />

                {!isWalletConnected ?
                    <Button 
                        variant="outline" 
                        bg="transparent" 
                        borderColor={borderColor}
                        onClick={() => toggleWalletModal()}>
                        Connect wallet
                    </Button>
                :
                    <>

                        <Button 
                            p={2}
                            variant="outline" 
                            bg="transparent" 
                            borderColor={borderColor} 
                            onClick={() => toggleWalletModal()}>
                            <HStack spacing="10px">
                                <Flex pl={2}>
                                    <Text
                                        color={textColor}
                                        fontSize="sm">                                    
                                        {balance != null ? Math.round(utils.formatEther(balance) * 1e3) / 1e3 + ' ' + network.symbol : ""}
                                    </Text>
                                </Flex>
                                <Flex 
                                    bg={addressBg}
                                    border="1px"
                                    borderColor={borderColor}
                                    p={1.5} rounded="md"
                                    position="relative">
                                    <Text
                                        color={textColor}
                                        fontSize="sm">                                    
                                        {truncate(wallet, 15, '...')}
                                    </Text>
                                </Flex>
                            </HStack>
                        </Button>

                        <Button 
                            variant="outline" 
                            bg="transparent" 
                            borderColor={borderColor}
                            onClick={() => toggleNetworkModal()}>
                            <HStack spacing="10px">
                                <Image 
                                    src={`images/${network.icon}`} 
                                    h="20px" objectFit="cover" />
                                <Text 
                                    fontSize="md" 
                                    color={textColor}>
                                    {network.name}                                    
                                </Text>
                            </HStack>
                        </Button>

                    </>
                }

                <IconButton
                    variant="ghost"
                    onClick={toggleColorMode}
                    aria-label="toggle theme"
                    icon={colorMode === 'dark' ? <FaSun /> : <FaMoon />} />

                <IconButton
                    as="a"
                    href="#"
                    aria-label="Twitter"
                    icon={<FaTwitter fontSize="20px" />} />

                <IconButton
                    as="a"
                    href="#"
                    aria-label="Discord"
                    icon={<FaDiscord fontSize="20px" />} />

            </ButtonGroup>

            

        </Flex>
    );

}