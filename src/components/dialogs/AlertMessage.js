
import React, { useState, useEffect } from "react";
import { ethers } from 'ethers';
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    Button,
  } from '@chakra-ui/react';
import useStore from '../../store';
import { networks } from '../../data/networks';

export default function AlertMessage(props) {
    const focusRef = React.useRef();    

    return (
        <>
            <AlertDialog
                motionPreset="slideInBottom"
                leastDestructiveRef={focusRef}
                isCentered
                isOpen={props.isOpen}>
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            {props.title}
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            {props.message}
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={focusRef} onClick={props.onClose}>
                                Ok
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
      );
}