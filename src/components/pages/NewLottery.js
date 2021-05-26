import React from "react";
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

export default function NewLottery () {

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
                minHeight="100px"
                bgColor={useColorModeValue("header.100", "header.900")}
                borderWidth="1px"
                borderColor={useColorModeValue("gray.200", "gray.700")}
                rounded="xl"
                position="relative"
                shadow="lg">

                <Wrap w="100%" 
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
                            <FormLabel>NFT contract:</FormLabel>
                            <Input placeholder="0x..." />
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
                            <FormLabel>NFT index:</FormLabel>
                            <Input placeholder="Index" />
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
                            <FormLabel>Ticket price:</FormLabel>
                            <Input placeholder="Price" />
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
                            "xl": "100%"
                        }}>
                        <Center>
                            <Button
                                fontSize={14}
                                bgColor={useColorModeValue("gray.300", "gray.700")}
                                variant="outline">
                                Validate
                            </Button>
                        </Center>
                    </WrapItem>

                    <WrapItem
                        p={{
                            "base": 0,
                            "md": 2,
                            "xl": 2
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
                                src="https://lh3.googleusercontent.com/g2k-3oCz6vUm2fzbASRZbyWl5SrdYd9MBp0XmQ3508Nvp_VO8WeZqjXy_ACrajKjIjxSilXCx7vfSCs6exFIGIfVctuhzVXp6_f-PXg=s0" />
                        </Center>

                    </WrapItem>

                </Wrap>

            </VStack>

        </VStack>

       
    );

} 
