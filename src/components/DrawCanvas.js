import React, {useState, useRef} from "react";
import {
    Button,
    Center,
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
import { HexColorPicker } from "react-colorful";
import { FaUndo, FaBroom, FaFileImage } from 'react-icons/fa';
// import "react-colorful/dist/index.css";
// import axios from 'axios';
// import FormData from 'form-data';
// const pinataSDK = require('@pinata/sdk');
// const pinata = pinataSDK(process.env.REACT_APP_PINATA_API_KEY, process.env.REACT_APP_PINATA_API_SECRET);
// const fs = require('fs');

const IPFS = require('ipfs-api');
const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });


export default function DrawCanvas () {
    const saveableCanvas = useRef(null);
    const [color, setColor] = useState("#000");
    // const [buffer, setBuffer] = useState(null);
    const [bgImage, setBgImage] = useState('images/canvasBackround.jpg');
    
    const [hash, setHash] = useState(null);

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
        });
    }

    async function handleChangeBackgroundImage() {
    
    }

    // function onChangeHandler(event){
    //     event.preventDefault();
    //     const file = event.target.files[0];
    //     setBgImage(file);
    // }

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

    return(
        <VStack>

            {/* <h1>{bgImage}</h1> */}

            <HStack w="100%">
                <IconButton
                    onClick={() => saveableCanvas.current.undo()}
                    as="a"
                    href="#"
                    aria-label="Undo"
                    icon={<FaUndo fontSize="20px" />} />
                <IconButton
                    onClick={() => saveableCanvas.current.clear()}
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
                    
                {/* <Button 
                    onClick={() => saveableCanvas.current.undo()}>
                    Undo
                </Button> */}
                {/* <Button 
                    onClick={() => saveableCanvas.current.clear()}>
                    Clear
                </Button> */}
                {/* <Button 
                    onClick={() => handleChangeBackgroundImage()}>
                    Background
                </Button> */}
                <Button 
                    onClick={() => handleSave()}>
                    Mint
                </Button>
                {/* <input type="file" name="file" onChange={onChangeHandler}/> */}
                {/* <SketchPicker /> */}
                
            </HStack>
            
            <CanvasDraw
                ref={saveableCanvas}            
                hideGrid={true}
                canvasWidth="500px"
                canvasHeight="500px"
                lazyRadius={0}
                brushRadius={2}
                brushColor={color}
                imgSrc={bgImage} />

            {/* <CanvasDraw
                brushColor="rgba(155,12,60,0.3)"
                imgSrc="https://upload.wikimedia.org/wikipedia/commons/a/a1/Nepalese_Mhapuja_Mandala.jpg"
                /> */}

            <HexColorPicker color={color} onChange={setColor} />
            <Link href={`https://ipfs.io/ipfs/${hash}`} isExternal>
                <Text color={'gray.500'}>{hash}</Text>
            </Link>
        </VStack>
    );

} 
