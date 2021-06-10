import React, {useState, useRef} from "react";
import {
    Button,
    Center,
    HStack,
    VStack,
    useColorModeValue
  } from '@chakra-ui/react';
import {
    Link,
} from "react-router-dom";
import useStore from '../store';
import CanvasDraw from "react-canvas-draw";
// import { SketchPicker } from 'react-color';
import { HexColorPicker } from "react-colorful";
// import "react-colorful/dist/index.css";
// import axios from 'axios';
// import FormData from 'form-data';
// const fs = require('fs');
const pinataSDK = require('@pinata/sdk');
const pinata = pinataSDK(process.env.REACT_APP_PINATA_API_KEY, process.env.REACT_APP_PINATA_API_SECRET);
const fs = require('fs');

export default function DrawCanvas () {
    const saveableCanvas = useRef(null);
    const [color, setColor] = useState("#000")

    function handleSave() {
        const img = saveableCanvas.current.getSaveData();
        console.log(img);
        const d = saveableCanvas.current.canvasContainer.children[1].toDataURL();
        console.log(d);
    }

    function handleChangeBackgroundImage() {
        //saveableCanvas.current.imgSrc=`d:\4785389.jpg`;
        testAuthentication();
        
    }

    const testAuthentication = () => {
        const readableStreamForFile = fs.createReadStream('./rKa8aNNp_400x400.jpg');
        // const options = {
        //     pinataMetadata: {
        //         name: 'My Awesome Website',
        //         keyvalues: {
        //             customKey: 'customValue',
        //             customKey2: 'customValue2'
        //         }
        //     },
        //     pinataOptions: {
        //         cidVersion: 0
        //     }
        // };
        // pinata.pinFromFS("./rKa8aNNp_400x400.jpg", options).then((result) => {
        //     //handle results here
        //     console.log(result);
        // }).catch((err) => {
        //     //handle error here
        //     console.log(err);
        // });


        // pinata.testAuthentication().then((result) => {
        //     //handle successful authentication here
        //     console.log(result);
        // }).catch((err) => {
        //     //handle error here
        //     console.log(err);
        // });
        // const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
        // let data = new FormData();
        // //data.append('file', fs.createReadStream('./rKa8aNNp_400x400.jpg'));

        // var readStream = fs.createReadStream('./rKa8aNNp_400x400.jpg');
        // console.log(readStream);

        // return axios
        //     .get(url,
        //         data, 
        //         {
        //             headers: {
        //                 'Content-Type': `multipart/form-data; boundary= ${data._boundary}`,
        //                 'pinata_api_key': process.env.REACT_APP_PINATA_API_KEY,
        //                 'pinata_secret_api_key': process.env.REACT_APP_PINATA_API_SECRET
        //         }
        //     })
        //     .then(function (response) {
        //         //handle your response here
        //         console.log(response)
        //     })
        //     .catch(function (error) {
        //         //handle error here
        //         console.log("error")
        //     });
    };

    function onChangeHandler(event){

        console.log(event.target.files[0])
    
    }

    return(
        <VStack>

            <HStack w="100%">
                <Button 
                    onClick={() => saveableCanvas.current.undo()}>
                    Undo
                </Button>
                <Button 
                    onClick={() => saveableCanvas.current.clear()}>
                    Clear
                </Button>
                <Button 
                    onClick={() => handleChangeBackgroundImage()}>
                    Background
                </Button>
                <Button 
                    onClick={() => handleSave()}>
                    Mint Drawing
                </Button>
                <input type="file" name="file" onChange={onChangeHandler}/>
                {/* <SketchPicker /> */}
                
            </HStack>
            
            <CanvasDraw
                ref={saveableCanvas}            
                hideGrid="True"
                canvasWidth="500px"
                canvasHeight="500px"
                lazyRadius="0"
                brushRadius="2"
                brushColor={color}
                />
            {/* <CanvasDraw
                brushColor="rgba(155,12,60,0.3)"
                imgSrc="https://upload.wikimedia.org/wikipedia/commons/a/a1/Nepalese_Mhapuja_Mandala.jpg"
                /> */}

            <HexColorPicker color={color} onChange={setColor} />
        </VStack>
    );

} 
