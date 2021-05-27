import React, { useEffect, useState } from "react";
import { ethers } from 'ethers';
import {
    Modal,
    ModalOverlay,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalBody,
    Button,
    HStack,
    Icon,
    Text,
    VStack
  } from '@chakra-ui/react';
import MetaMaskOnboarding from '@metamask/onboarding';
import WalletOption from './WalletOption';
import NetworkOption from './NetworkOption';
import AlertMessage from './AlertMessage';
import useStore from '../../store';
import { truncateMiddle } from '../../utils/stringsHelper';
import { FaUserCircle } from 'react-icons/fa';
import { networks } from '../../data/networks';
import { coins } from '../../data/coins';

export default function Wallets() {
    const [isWrongNetworkAlertOpen, setIsWrongNetworkAlertOpen] = useState(false);
    const { setProvider, network, wallet, isWalletConnected, walletModalIsOpen, networkModalIsOpen, toggleWalletModal, toggleNetworkModal, setWalletModal, setNetwork } = useStore();

    useEffect(async () => {
        await getDefaultProvider();
    }, []);

    async function getDefaultProvider() {
        await window.ethereum.enable();
        if (network == null || network == undefined) {
            const networkItem = networks.find(i => i.code === process.env.REACT_APP_DEFAULT_NETWORK);            
            const coinItem = coins.find(c => c.symbol === networkItem.symbol);

            // Setting infura key
            const infuraKey = process.env.REACT_APP_INFURA_API_KEY;
            const rpcUrl = networkItem.rpcUrl.replace("[INFURA_KEY]",infuraKey);
            networkItem.rpcUrl = rpcUrl;
            
            let provider = null;                        
            
            provider = new ethers.providers.JsonRpcProvider(networkItem.rpcUrl);
            setProvider(provider, null, null, networkItem, 0, coinItem);
        }
    }

    async function connectMetamask(net)
    {
        let provider = null;
        await window.ethereum.enable();
        if (net == "default") {
            provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        } else {
            provider = new ethers.providers.Web3Provider(window.ethereum, net);
        }

        const network = await provider.getNetwork();
        const networkItem = networks.find(i => i.chainId === network.chainId);        
        if (networkItem && networkItem.enabled)
        {
            // Setting infura key
            const infuraKey = process.env.REACT_APP_INFURA_API_KEY;
            const rpcUrl = networkItem.rpcUrl.replace("[INFURA_KEY]",infuraKey);
            networkItem.rpcUrl = rpcUrl;

            const signer = provider.getSigner();
            const wallet = await signer.getAddress();        
            const bal = await signer.getBalance();
            const coinItem = coins.find(c => c.symbol === networkItem.symbol);
            setProvider(provider, signer, wallet, networkItem, bal, coinItem);            
    
            provider.removeAllListeners("network");
            provider.on("network", (newNetwork, oldNetwork) => {
                connectMetamask("default");
            });
    
            window.ethereum.on('accountsChanged', function (accounts) {
                connectMetamask("default");
            });
        } else {
            setIsWrongNetworkAlertOpen(true);
        }
        setWalletModal(false);
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
        const isMetamask = window.ethereum && MetaMaskOnboarding.isMetaMaskInstalled();
        //const { ethereum } = window;
        //const isMetamask = true; //ethereum && ethereum.isMetaMask;
        
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
                        {truncateMiddle(wallet, 25, '...')}
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
                        { networks
                            .filter(n => n.enabled)
                            .map((n, index) => (
                            <WalletOption 
                                name={n.name}
                                image={`images/${n.icon}`}
                                onClick={() => handleNetworkSelected(n.code)} />
                        )) }
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
            
            <AlertMessage
                isOpen={isWrongNetworkAlertOpen}
                onClose={() => setIsWrongNetworkAlertOpen(false)}
                title="Wrong Network"
                message="Please connect to the appropriate Ethereum network." />

        </div>
      );
}