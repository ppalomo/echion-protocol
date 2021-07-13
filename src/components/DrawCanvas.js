import React, {useState, useRef} from "react";
import { ethers } from 'ethers';
import {
    Button,
    Center,
    Flex,
    FormControl,
    FormLabel,
    IconButton,
    Input,            
    InputGroup,
    InputLeftElement,
    Link,
    HStack,
    VStack,
    Text,
    useColorModeValue
  } from '@chakra-ui/react';
import useStore from '../store';
import CanvasDraw from "react-canvas-draw";
// import { SketchPicker } from 'react-color';
// import { HexColorPicker } from "react-colorful";
import { TwitterPicker  } from 'react-color';
import { FaUndo, FaBroom, FaFileImage } from 'react-icons/fa';
import { useContract, useContractByAddress, useAdminContract, useAdminContractByAddress } from '../hooks/contractHooks';
// import "react-colorful/dist/index.css";
// import axios from 'axios';
// import FormData from 'form-data';
// const pinataSDK = require('@pinata/sdk');
// const pinata = pinataSDK(process.env.REACT_APP_PINATA_API_KEY, process.env.REACT_APP_PINATA_API_SECRET);
// const fs = require('fs');

const IPFS = require('ipfs-api');
const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });


export default function DrawCanvas () {
    const nftContract = useContract("EchionNFT");
    const factoryContract = useContract("LotteryPoolFactory");
    const defaultBgImage = 'images/canvasBackround.jpg';
    const { isWalletConnected, wallet } = useStore();
    const saveableCanvas = useRef(null);
    const [color, setColor] = useState("#000");
    const [bgImage, setBgImage] = useState(defaultBgImage);
    const [name, setName] = useState(null)
    const colors = ['#000000', '#D9E3F0', '#F47373', '#697689', '#37D67A', '#2CCCE4', '#555555', '#dce775', '#ba68c8', '#FFFFFF'];  
    const [hash, setHash] = useState(null);
    const [metadataHash, setMetadataHash] = useState(null);


    function handleSave() {
        let baseCanvas = saveableCanvas.current.canvasContainer.children[3];
        let baseCanvasContex = baseCanvas.getContext('2d');
        baseCanvasContex.drawImage(saveableCanvas.current.canvasContainer.children[1], 0, 0);
        const data = baseCanvas.toDataURL();
        var imageBuffer = decodeBase64Image(data);                
        
        // Uploading image to IPFS
        ipfs.files.add(imageBuffer.data, (error, result) => {
            if(error) {
                console.error(error)
                return
            }
            setHash(result[0].hash);
            uploadMetadata(result[0].hash);
        });
    }

    async function uploadMetadata(imgHash){
        const metadata = `{
            "image": "https://ipfs.io/ipfs/${imgHash}",
            "name": "${name}",
            "attributes": [
                {
                    "trait_type": "Creator",
                    "value": "${wallet}"
                }
            ]
        }`;

        var imageBuffer = Buffer.from(metadata);

        // Uploading image to IPFS
        ipfs.files.add(imageBuffer, (error, result) => {
            if(error) {
                console.error(error)
                return
            }
            setMetadataHash(result[0].hash);
            mintNFT(imgHash, result[0].hash);
        });
    }


    async function mintNFT(iHash, mHash){
        const imageURI = 'https://ipfs.io/ipfs/' + iHash;
        const metadataURI = 'https://ipfs.io/ipfs/' + mHash;
        try {
            if(nftContract) {
                const tx = await nftContract.mint(imageURI, metadataURI);
                const result = await tx.wait();
                console.log("index = ", result.events[0].args[2].toString());
                console.log("nftContract.address = ", nftContract.address);
                handleCreateLottery(nftContract.address, result.events[0].args[2]);
            }
        } catch (error) {
            
        }
    }

    async function handleCreateLottery(nftAddress, nftIndex) {
        try {
            if(factoryContract != null) {
                const tx = await factoryContract.createLottery(nftAddress, nftIndex, ethers.utils.parseEther("0.001"), 0, 0);
                await tx.wait();
            }
        } catch (err) {
            console.log("Error: ", err);
        }
    }


    function decodeBase64Image(dataString) {
        var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
          response = {};
      
        if (matches.length !== 3) {
          return new Error('Invalid input string');
        }
      
        response.type = matches[1];
        response.data = new Buffer(matches[2], 'base64');
      
        return response;
    }
    
    function handleChangeBackground(e) {
        var input = document.createElement('input');
        input.type = 'file';

        input.onchange = e => { 
            e.preventDefault();
            var file = URL.createObjectURL(e.target.files[0]);
            setBgImage(file);
            saveableCanvas.current.drawImage();
        }

        input.click();
    }

    function handleColorChanged(color){
        setColor(color.hex);
    }

    function handleClearCanvas(e) {
        e.preventDefault();
        setBgImage(defaultBgImage);
        saveableCanvas.current.drawImage();
        e.preventDefault();
        saveableCanvas.current.clear();
    }

    function handleNameChange(e) {
        setName(e.target.value);
    }

    return(
        <VStack>

            <VStack w="100%" >
                <FormControl m={4}>
                    <FormLabel>NFT Name:</FormLabel>
                    <Input fontSize={14} placeholder="Put the best name you can imagine" onChange={handleNameChange} />
                </FormControl>
            </VStack>

            <HStack w="100%" pb={4}>
                
                <IconButton
                    onClick={() => saveableCanvas.current.undo()}
                    as="a"
                    href="#"
                    aria-label="Undo"
                    icon={<FaUndo fontSize="20px" />} />
                <IconButton
                    onClick={handleClearCanvas}
                    as="a"
                    href="#"
                    aria-label="Clear"
                    icon={<FaBroom fontSize="20px" />} />
                <IconButton
                    type="file"
                    onClick={handleChangeBackground}
                    as="a"
                    href="#"
                    aria-label="Clear"
                    icon={<FaFileImage fontSize="20px" />} />
                <Button
                    isDisabled={!isWalletConnected}
                    onClick={() => handleSave()}>
                    Mint
                </Button>
                
            </HStack>
            
            <Center>
                <CanvasDraw
                    
                    ref={saveableCanvas}            
                    hideGrid={true}
                    canvasWidth="600px"
                    canvasHeight="600px"
                    lazyRadius={0}
                    brushRadius={2}
                    brushColor={color}
                    imgSrc={bgImage} />
            </Center>

            <Flex w="100%" pt={4}>
                <TwitterPicker 
                    onChangeComplete={handleColorChanged} 
                    colors={colors}/>
            </Flex>
            
            <Link href={`https://ipfs.io/ipfs/${hash}`} isExternal>
                <Text color={'gray.500'}>{hash}</Text>
            </Link>

            <Link href={`https://ipfs.io/ipfs/${metadataHash}`} isExternal>
                <Text color={'gray.500'}>{metadataHash}</Text>
            </Link>

        </VStack>
    );

} 
