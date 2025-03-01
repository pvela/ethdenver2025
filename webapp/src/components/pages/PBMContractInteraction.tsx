import React, { useState, useEffect } from 'react';
import { Provider } from "zksync-ethers";
import { ethers } from "ethers";

import PBMFreeContract from '../../../artifacts/PBMFreeContract.json';

const PBMContractInteraction: React.FC = () => {
    const [contract, setContract] = useState<ethers.Contract | null>(null);
    const [account, setAccount] = useState<string>('');
    const [productName, setProductName] = useState<string>('');
    const [productPrice, setProductPrice] = useState<string>('');
    const [discountPercentage, setDiscountPercentage] = useState<string>('');
    const [discountedPrice, setDiscountedPrice] = useState<string>('');
    const [role, setRole] = useState<string>('');

    useEffect(() => {
        const init = async () => {
            if ((window as any).ethereum) {
                try {
                    const accounts: string[] = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
                    setAccount(accounts[0]);

                    // Update provider to use zkSync Era testnet
                    const zkSyncProvider = new Provider('https://testnet.era.zksync.dev');
                    
                    // Create Web3Provider from window.ethereum
                    const ethereumProvider = new ethers.BrowserProvider((window as any).ethereum);
                    const signer = await ethereumProvider.getSigner();
                    
                    // Replace with your deployed contract address on zkSync testnet
                    const contractAddress = "0x02A2D65AcF781e2110990426f3D11bDDe99a2b3A";
                    const pbmContract = new ethers.Contract(
                        contractAddress,
                        PBMFreeContract.abi,
                        signer
                    );

                    setContract(pbmContract);

                    // Determine role
                    const manufacturer = await pbmContract.manufacturer();
                    const insuranceCompany = await pbmContract.insuranceCompany();
                    
                    if (accounts[0].toLowerCase() === manufacturer.toLowerCase()) {
                        setRole('manufacturer');
                    } else if (accounts[0].toLowerCase() === insuranceCompany.toLowerCase()) {
                        setRole('insurance');
                    } else {
                        setRole('pharmacy');
                    }

                } catch (error) {
                    console.error("Error initializing contract:", error);
                }
            }
        };

        init();
    }, []);

    const handleSetPrice = async () => {
        if (!contract) return;
        try {
            const tx = await contract.setProductPrice(
                productName, 
                ethers.parseEther(productPrice),
                { customData: { gasPerPubdata: 50000 } } // zkSync specific
            );
            await tx.wait();
            alert("Price set successfully!");
        } catch (error) {
            console.error("Error setting price:", error);
            alert("Error setting price. Check console for details.");
        }
    };

    const handleApproveDiscount = async () => {
        if (!contract) return;
        try {
            const tx = await contract.approveDiscount(
                productName, 
                discountPercentage,
                { customData: { gasPerPubdata: 50000 } } // zkSync specific
            );
            await tx.wait();
            alert("Discount approved successfully!");
        } catch (error) {
            console.error("Error approving discount:", error);
            alert("Error approving discount. Check console for details.");
        }
    };

    const handleCheckDiscountedPrice = async () => {
        if (!contract) return;
        try {
            const price = await contract.availDiscountedPrice(productName);
            setDiscountedPrice(ethers.formatEther(price));
        } catch (error) {
            console.error("Error checking discounted price:", error);
            alert("Error checking discounted price. Check console for details.");
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">PBM Contract Interaction</h1>
            <p className="mb-4">Connected Account: {account}</p>
            <p className="mb-4">Role: {role}</p>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Product Name"
                    className="border p-2 mr-2"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                />
            </div>

            { (
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Product Price (ETH)"
                        className="border p-2 mr-2"
                        value={productPrice}
                        onChange={(e) => setProductPrice(e.target.value)}
                    />
                    <button
                        onClick={handleSetPrice}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Set Price
                    </button>
                </div>
            )}

            { (
                <div className="mb-4">
                    <input
                        type="number"
                        placeholder="Discount Percentage"
                        className="border p-2 mr-2"
                        value={discountPercentage}
                        onChange={(e) => setDiscountPercentage(e.target.value)}
                    />
                    <button
                        onClick={handleApproveDiscount}
                        className="bg-green-500 text-white px-4 py-2 rounded"
                    >
                        Approve Discount
                    </button>
                </div>
            )}

            { (
                <div className="mb-4">
                    <button
                        onClick={handleCheckDiscountedPrice}
                        className="bg-purple-500 text-white px-4 py-2 rounded"
                    >
                        Check Discounted Price
                    </button>
                    {discountedPrice && (
                        <p className="mt-2">Discounted Price: {discountedPrice} ETH</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default PBMContractInteraction; 