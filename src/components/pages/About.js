import React from "react";
import {
    Center,
    Text,
    VStack,
  } from '@chakra-ui/react';

export default function Home () {

    return(
        <Center mt="10rem">
            <VStack spacing={10}>
                <Text
                    bgGradient="linear(to-l, #7928CA,#FF0080)"
                    bgClip="text"
                    fontSize="6xl"
                    fontWeight="extrabold">
                    About the team
                </Text>
                
            </VStack>
        </Center>
    );

} 
