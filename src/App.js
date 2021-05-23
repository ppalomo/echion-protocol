//#region [Imports]

import './styles/App.css';
import React, { useState } from 'react';
import { ethers } from 'ethers';
import { 
  Button,
  ChakraProvider,
  Input,
  VStack,
  useColorModeValue
} from "@chakra-ui/react";
import { BrowserRouter as Router, } from "react-router-dom";
import useStore from './store';
import theme from './styles/theme';
import Header from './components/Header';
import Content from './components/Content';
// import Content from './components/Content';
import Dialogs from './components/Dialogs';


//#endregion

const greeterAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";

export default function App() {
  const { isWalletConnected, signer, provider } = useStore();

  // // request access to the user's MetaMask account
  // async function requestAccount() {
  //   await window.ethereum.request({ method: 'eth_requestAccounts' });
  // }

  // // call the smart contract, read the current greeting value
  // async function fetchGreeting() {
  //   if (isWalletConnected) {
  //     // const provider = new ethers.providers.Web3Provider(window.ethereum)
  //     const contract = new ethers.Contract(greeterAddress, Greeter.abi, provider);
  //     try {
  //       const data = await contract.greet();
  //       console.log('data: ', data);
  //     } catch (err) {
  //       console.log("Error: ", err);
  //     }
  //   }    
  // }

  // // call the smart contract, send an update
  // async function setGreeting() {
  //   if (!greeting) return
  //   if (typeof window.ethereum !== 'undefined') {
  //     await requestAccount()
  //     const provider = new ethers.providers.Web3Provider(window.ethereum);
  //     const signer = provider.getSigner()
  //     const contract = new ethers.Contract(greeterAddress, Greeter.abi, signer)
  //     console.log(greeting)
  //     const transaction = await contract.setGreeting(greeting)
  //     await transaction.wait()
  //     fetchGreeting()
  //   }
  // }

  return (
    <Router>
      <div className="App">
        <ChakraProvider theme={theme}>
          <Header />        
          <Content />
            {/* <header className="App-header">
              <VStack>
                <Button onClick={fetchGreeting}>Fetch Greeting</Button>
                <Button onClick={setGreeting}>Set Greeting</Button>
                <Input onChange={e => setGreetingValue(e.target.value)} placeholder="Set greeting" />
              </VStack>
            </header> */}
          <Dialogs />
        </ChakraProvider>
      </div>
    </Router>
  );



  // return (
  //   <div className="App">
  //     <header className="App-header">
  //       <button onClick={fetchGreeting}>Fetch Greeting</button>
  //       <button onClick={setGreeting}>Set Greeting</button>
  //       <input onChange={e => setGreetingValue(e.target.value)} placeholder="Set greeting" />
  //     </header>
  //   </div>
  // );
  
}



// import { 
//   ChakraProvider,
//   Center,
//   useColorModeValue
// } from "@chakra-ui/react";
// import {
//   BrowserRouter as Router,
// } from "react-router-dom";
// import './App.css';
// import Header from './components/Header';
// import Content from './components/Content';
// import Dialogs from './components/Dialogs';
// import useStore from './store';
// import theme from './theme';

// export default function App() {
//   const [counter, setCounter] = useState(0);
  
//   const increment = () => {
//     setCounter(counter + 1);
//   };

//   return (
//     <Router>
//       <div className="App">
//         <ChakraProvider theme={theme}>
//           <Header />        
//           <Content />
//           <Dialogs />
//         </ChakraProvider>
//       </div>
//     </Router>
//   );

// }