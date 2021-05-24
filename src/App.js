//#region [Imports]

import './styles/App.css';
import React from 'react';
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter as Router, } from "react-router-dom";
import theme from './styles/theme';
import Header from './components/Header';
import Content from './components/Content';
import Dialogs from './components/Dialogs';

//#endregion

export default function App() {

  return (
    <Router>
      <div className="App">
        <ChakraProvider theme={theme}>
          <Header />
          <Content />
          <Dialogs />
        </ChakraProvider>
      </div>
    </Router>
  );

}