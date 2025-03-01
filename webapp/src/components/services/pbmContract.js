import { ethers } from 'ethers';
import PBMFreeContract from '../../artifacts/PBMFreeContract.json';

export const getPBMContract = async () => {
    if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    
    // Replace with your deployed contract address
    const contractAddress = "0x277c471Ba187082C9836F92c5D2fA37824Fc0749";
    
    return new ethers.Contract(
        contractAddress,
        PBMFreeContract.abi,
        signer
    );
};

export const connectWallet = async () => {
    if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
    }

    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        return accounts[0];
    } catch (error) {
        throw new Error('Failed to connect wallet');
    }
}; 