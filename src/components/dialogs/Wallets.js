import React, { useEffect } from "react";
import { ethers } from 'ethers';
import {
    Modal,
    ModalOverlay,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalBody,
    Button,
    Center,
    Flex,
    HStack,
    Icon,
    Image,
    Text,
    VStack
  } from '@chakra-ui/react';
import MetaMaskOnboarding from '@metamask/onboarding';
import WalletOption from './WalletOption';
import NetworkOption from './NetworkOption';
import useStore from '../../store';
import { truncate } from '../../utils/stringsHelper';
import { FaUserCircle } from 'react-icons/fa';
import { networks } from '../../data/networks';

export default function Wallets() {
    // const [isFirstConnection, setstate] = useState(initialState)
    const { setProvider, wallet, isWalletConnected, walletModalIsOpen, networkModalIsOpen, toggleWalletModal, toggleNetworkModal, setWalletModal, setBalance } = useStore();

    // useEffect(() => {
        
    // }, []);

    async function connectMetamask(net)
    {
        // console.log(`Network: ${net}`);
        let provider = null;
        await window.ethereum.enable();
        if (net == "default") {
            provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        } else {
            // console.log("connecting")
            provider = new ethers.providers.Web3Provider(window.ethereum, net);
            //provider = new ethers.providers.Web3Provider(window.ethereum, ethers.providers.networks.ropsten)
            // console.log(ethers.networks)
            // provider = new ethers.providers.Web3Provider(window.ethereum, "ropsten"); 
            //new ethers.providers.Web3Provider(window.ethereum, "rinkeby");
        }

        // console.log(provider);
        const signer = provider.getSigner();
        const wallet = await signer.getAddress();
        const network = await provider.getNetwork();
        const networkItem = networks.find(i => i.chainId === network.chainId);
        const bal = await signer.getBalance();

        setProvider(provider, signer, wallet, networkItem, bal);
        setWalletModal(false);

        provider.removeAllListeners("network");
        provider.on("network", (newNetwork, oldNetwork) => {
            connectMetamask("default");
        });

        window.ethereum.on('accountsChanged', function (accounts) {
            connectMetamask("default");
        });
    }

    function disconnectWallet() {
        setProvider(null, null, null, null);
        toggleWalletModal();
    }

    function handleNetworkSelected(network) {
        connectMetamask(network);
        toggleNetworkModal();
    }

    function getOptions() {
        //const isMetamask = window.ethereum && MetaMaskOnboarding.isMetaMaskInstalled();
        //const { ethereum } = window;
        const isMetamask = true; //ethereum && ethereum.isMetaMask;
        
        return (
            <>
                {isMetamask ? 
                    <WalletOption 
                        name="Metamask"
                        image="images/metamask.svg"
                        onClick={() => connectMetamask("default")}
                        />
                    :
                    <WalletOption 
                        name="Install Metamask"
                        image="images/metamask.svg"
                        />
                }
                <WalletOption 
                    name="Wallet Connect"
                    image="images/walletconnect.svg"
                    />
            </>
        )
    }

    function getWalletInfo() {
        return (
            <VStack p={10} spacing={10}>
                <HStack spacing={3}>
                    <Icon w={6} h={6} as={FaUserCircle} />
                    <Text fontSize="md" fontWeight="600" m="0" userSelect="none" ml="1.5rem">
                        {truncate(wallet, 25, '...')}
                    </Text>
                </HStack>
                <Button onClick={disconnectWallet}>
                    Disconnect
                </Button>
            </VStack>
        )
    }

    function getWalletModalContent() {
        return (
            <>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{ isWalletConnected ? "Your wallet" : "Connect your wallet" }</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {isWalletConnected ?
                            getWalletInfo()
                        :
                            getOptions()
                        }
                    </ModalBody>
                </ModalContent>
            </>
        );
    }

    function getNetworkModalContent() {
        return (
            <>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Select a Network</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <WalletOption 
                            name="Ethereum Mainnet"
                            image="images/eth-icon.svg"
                            onClick={() => handleNetworkSelected("mainnet")} />
                        <WalletOption 
                            name="Rinkeby Testnet"
                            image="images/eth-icon.svg"
                            onClick={() => handleNetworkSelected("rinkeby")} />
                        <WalletOption 
                            name="Ropsten Testnet"
                            image="images/eth-icon.svg"
                            onClick={() => handleNetworkSelected("ropsten")} />
                        <WalletOption 
                            name="Polygon"
                            image="images/polygon-icon.svg"
                            onClick={() => handleNetworkSelected("matic")} />
                        <WalletOption 
                            name="Mumbai Testnet"
                            image="images/polygon-icon.svg"
                            onClick={() => handleNetworkSelected("mumbai")} />
                        <WalletOption 
                            name="Binance Smart Chain"
                            image="images/binance-icon.svg"
                            onClick={() => handleNetworkSelected("bsc")} />
                    </ModalBody>
                </ModalContent>
            </>
        );
    }

    return (
        <div>
            {/* <Modal
                isOpen={networkModalIsOpen}
                onClose={toggleNetworkModal}
                isCentered>
                {getNetworkModalContent()}
            </Modal> */}
            <Modal
                isOpen={walletModalIsOpen}
                onClose={toggleWalletModal}
                isCentered>
                    {getWalletModalContent()}
            </Modal>
        </div>
      );
}