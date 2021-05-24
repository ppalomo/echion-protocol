import React from "react";
import {
    HStack,
  } from '@chakra-ui/react';
import {
    Link,
} from "react-router-dom";
import useStore from '../store';
import { topMenuItems } from '../data/menuItems';

export default function TopMenu () {
    const { pageSelected } = useStore();

    return(
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
    );

} 
