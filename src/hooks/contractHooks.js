import { ethers } from 'ethers';
import useStore from '../store';

export const useContract = (contractName) => {
    const { isWalletConnected, network, signer } = useStore();

    if (isWalletConnected) {
        try {
            // Getting contract's address
            const uri = `REACT_APP_${contractName.toUpperCase()}_${network.code.toUpperCase()}_ADDRESS`;
            const address = process.env[uri];

            // Getting contract's abi
            var json = require(`../artifacts/contracts/${contractName}.sol/${contractName}.json`);
            
            // Creating contract's instance
            const instance = new ethers.Contract(address, json.abi, signer);
            return instance;
        } catch (error) {
            return null;
        }        
    }
    else
        return null;
}

export const useAdminContract = (contractName) => {
    const { network, provider } = useStore();
    try {
        // Getting admin wallet
        const privateKey = process.env.REACT_APP_DEPLOYER_PRIVATE_KEY;
        let wallet = new ethers.Wallet(privateKey, provider);

        // Getting contract's address
        const uri = `REACT_APP_${contractName.toUpperCase()}_${network.code.toUpperCase()}_ADDRESS`;
        const address = process.env[uri];

        // Getting contract's abi
        var json = require(`../artifacts/contracts/${contractName}.sol/${contractName}.json`);
        
        // Creating contract's instance
        const instance = new ethers.Contract(address, json.abi, wallet);
        return instance;
    } catch (error) {
        return null;
    }
}