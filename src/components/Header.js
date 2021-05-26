//#region [Imports]

import React, {useEffect} from "react";
import {
    Button,
    ButtonGroup,
    Flex,
    HStack,
    IconButton,
    Image,
    Text,
    useColorMode,
    useColorModeValue,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuDivider,
    ChevronDownIcon,
    HamburgerIcon,
} from '@chakra-ui/react';
import {
    Link,
} from "react-router-dom";
import { utils } from 'ethers';
import { FaDiscord, FaMoon, FaSun, FaTwitter, FaBars } from 'react-icons/fa';
import { truncateMiddle } from '../utils/stringsHelper';
import useStore from '../store';
import { topMenuItems } from '../data/menuItems';

//#endregion

export default function Header (props) {
    const { colorMode, toggleColorMode } = useColorMode();
    const { isWalletConnected, wallet, balance, coin, setBalance, signer, network, toggleWalletModal, toggleNetworkModal, pageSelected, setNetwork } = useStore();
    const borderColor = useColorModeValue("border.100", "border.900");
    const textColor = useColorModeValue("text.100", "text.900");
    const addressBg = useColorModeValue("border.100", "border.900");

    return(
        <>

            <Flex
                display={{
                    base: "none",
                    md: "none",
                    xl: "flex"
                }}
                as="header"
                w="100%"
                h={{
                    base: "5rem", // 0-48em
                    md: "5rem", // 48em-80em,
                    xl: "5rem", // 80em+
                }}
                m="0 auto"
                position="sticky"
                alignItems="center"
                justifyContent="space-between"
                px={['0.5rem', '0.5rem', '1.5rem']}
                bgColor={useColorModeValue("header.100", "header.900")}
                borderBottom="1px"
                borderColor={borderColor}>

                <Link to="/">
                    <Text
                        bgGradient="linear(to-l, #7928CA,#FF0080)"
                        bgClip="text"
                        fontSize={{
                            "base": "2xl",
                            "md": "4xl",
                            "xl": "4xl"
                        }}
                        fontWeight="extrabold">
                        Echion Protocol
                    </Text>
                </Link>

                <ButtonGroup variant="ghost" color="gray.600" mr="1rem">

                    <HStack mr={5} spacing={5}>
                        {topMenuItems.map((item, index) => (
                            <Link
                                key={index}
                                className={pageSelected == item.id ? "top-menu-link-selected" : "top-menu-link"}
                                to={item.url} >
                                {item.title}
                            </Link>
                        ))}
                    </HStack>

                    {!isWalletConnected ?
                        <Button 
                            variant="outline" 
                            bg="transparent" 
                            borderColor={borderColor}
                            onClick={() => toggleWalletModal()}>
                            Connect wallet
                        </Button>
                    :
                        <Button 
                            p={2}
                            variant="outline" 
                            bg="transparent" 
                            borderColor={borderColor} 
                            onClick={() => toggleWalletModal()}>
                            <HStack spacing="10px">
                                <Flex pl={2}>
                                    <HStack>
                                        <Text 
                                            color={textColor}
                                            fontSize="sm">
                                            {balance != null ? Math.round(utils.formatEther(balance) * 1e3) / 1e3 : ""}
                                        </Text>
                                        <Image h={4} src={coin ? coin.image : ""} />
                                    </HStack>
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
                                        {truncateMiddle(wallet, 15, '...')}
                                    </Text>
                                </Flex>
                            </HStack>
                        </Button>
                    }

                    { network ?
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
                    :
                    <></>
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

            <Flex
                zIndex="1"
                display={{
                    base: "flex",
                    md: "flex",
                    xl: "none"
                }}
                as="header"
                w="100%"
                h={{
                    base: "5rem", // 0-48em
                    md: "5rem", // 48em-80em,
                    xl: "5rem", // 80em+
                }}
                m="0 auto"
                position="sticky"
                alignItems="center"
                justifyContent="space-between"
                px={['1rem', '1rem', '1.5rem', '1.5rem']}
                bgColor={useColorModeValue("header.100", "header.900")}
                borderBottom="1px"
                borderColor={borderColor}>

                <Link to="/">
                    <Text
                        bgGradient="linear(to-l, #7928CA,#FF0080)"
                        bgClip="text"
                        fontSize={{
                            "base": "2xl",
                            "md": "4xl",
                            "xl": "4xl"
                        }}
                        fontWeight="extrabold">
                        Echion Protocol
                    </Text>
                </Link>

                <Menu>
                    <MenuButton
                        aria-label="Options"
                        variant="outline">
                            <FaBars />
                            {/* <IconButton
                                variant="outline"
                                aria-label="toggle theme"
                                icon={<FaBars />} /> */}
                        </MenuButton>
                    <MenuList>
                        {topMenuItems.map((item, index) => (
                            <MenuItem key={index}>
                                <Link
                                    className="top-menu-mobile"
                                    to={item.url} >
                                    {item.title}
                                </Link>
                            </MenuItem>
                        ))}
                        <MenuDivider />
                        <MenuItem onClick={toggleColorMode}>
                            {colorMode === 'dark' ? "Light Mode" : "Dark Mode"}
                        </MenuItem>
                    </MenuList>
                </Menu>

            </Flex>
            <Flex
                zIndex="0"
                display={{
                    base: "flex",
                    md: "flex",
                    xl: "none"
                }}
                as="header"
                w="100%"
                h={{
                    base: "5rem", // 0-48em
                    md: "5rem", // 48em-80em,
                    xl: "5rem", // 80em+
                }}
                m="0 auto"
                position="sticky"
                alignItems="center"
                justifyContent="space-between"
                px={['1rem', '1rem', '1.5rem', '1.5rem']}
                bgColor={useColorModeValue("bg.100", "bg.900")}
                borderBottom="1px"
                borderColor={borderColor}>

                {!isWalletConnected ?
                        <Button 
                            variant="outline" 
                            bg="transparent" 
                            borderColor={borderColor}
                            onClick={() => toggleWalletModal()}>
                            Connect wallet
                        </Button>
                    :
                        <Button 
                            p={2}
                            variant="outline" 
                            bg="transparent" 
                            borderColor={borderColor} 
                            onClick={() => toggleWalletModal()}>
                            <HStack spacing="10px">
                                <Flex pl={2}>
                                    <HStack>
                                        <Text 
                                            color={textColor}
                                            fontSize="sm">
                                            {balance != null ? Math.round(utils.formatEther(balance) * 1e3) / 1e3 : ""}
                                        </Text>
                                        <Image h={4} src={coin ? coin.image : ""} />
                                    </HStack>
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
                                        {truncateMiddle(wallet, 15, '...')}
                                    </Text>
                                </Flex>
                            </HStack>
                        </Button>
                    }

                    { network ?
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
                    :
                    <></>
                    }

            </Flex>

        </>
    );

}