//#region [Imports]

import React, {useEffect} from "react";
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
  } from '@chakra-ui/react';
import { ethers } from 'ethers';
import { FaDiscord, FaMoon, FaSun, FaTwitter } from 'react-icons/fa';
import { truncate } from '../utils/stringsHelper';
import useStore from '../store';

//#endregion

export default function Header (props) {
    const { colorMode, toggleColorMode } = useColorMode();
    const { isWalletConnected, wallet, signer, network, toggleWalletModal, toggleNetworkModal, networkModalIsOpen } = useStore();
    const borderColor = useColorModeValue("border.100", "border.900");
    const textColor = useColorModeValue("text.100", "text.900");

    // useEffect(async () => {
    //     if (signer != null) {
    //         const balance = await signer.getBalance();
    //         console.log(balance.toString());
    //     }
    // }, []);

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
                        variant="outline" 
                        bg="transparent" 
                        borderColor={borderColor} 
                        onClick={() => toggleWalletModal()}>
                        <HStack spacing="10px">
                            <Text
                                color={textColor}
                                fontSize="md">
                                {truncate(wallet, 15, '...')}
                            </Text>
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