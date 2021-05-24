import React, { useState, useEffect } from "react";
import {
    HStack,
    ReachLink
  } from '@chakra-ui/react';
import {
    Link,  
} from "react-router-dom";

export default function TopMenu (props) {

    return(
        <HStack mr={5} spacing={5}>

            <Link to="/">
                Home
            </Link>
            <Link to="/about">
                About
            </Link>

            {/* <Link as={ReachLink} href="/">
                Pools
            </Link>
            <Link as={ReachLink} href="/about">
                Votes
            </Link> */}
        </HStack>
    );

} 
