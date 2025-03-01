import React, { useState, useCallback, useEffect } from 'react';
import { Drug } from '../types/Drug';
import { searchDrugs } from '../services/drugApi';
import debounce from 'lodash/debounce';
import Grid from './Grid';
import NativeSelect from '@mui/material/NativeSelect';

import { Provider } from "zksync-ethers";
import { ethers } from "ethers";
import PBMFreeContract from '../../../artifacts/PBMFreeContract.json';


import Select, { SelectChangeEvent } from '@mui/material/Select';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';



export default function Insurance() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  // const [selectedDrugList, setSelectedDrugList] = useState<Drug[]>([]);
  const [pickedDrug, setPickedDrug] = useState<Drug | null>(null);
  const [error, setError] = useState('')
  const [manHistData, setManHistData] = useState<PriceEntry[]>([]);
  const [approvalRequired, setApprovalRequired] = useState(false);
  const [storedData, setStoredData] = useState<StorageData[]>();
  const [mfrDrugData, setMfrDrugData] = useState<Drug>();

        const [contract, setContract] = useState<ethers.Contract | null>(null);
        const [account, setAccount] = useState<string>('');
        const [productName, setProductName] = useState<string>('');
        const [productPrice, setProductPrice] = useState<string>('');
        const [discountPercentage, setDiscountPercentage] = useState<string>('');
        const [discountedPrice, setDiscountedPrice] = useState<string>('');
        const [role, setRole] = useState<string>('');
    
  

  interface PriceEntry {
    price: number;
    date: string;
  }
  
  interface StorageData {
    drugName: string;
    history: PriceEntry[];
  }

  useEffect(() => {
    // Load data from localStorage when component mounts
    const savedData = localStorage.getItem('manHistData');
    if (savedData) {
      setStoredData(JSON.parse(savedData));
    }
    const mfrDD = localStorage.getItem('MfrDrugData');
    if (mfrDD) {
      setMfrDrugData(JSON.parse(mfrDD));
    }
    // alert('Use effect mfr DD ... ' +  JSON.stringify(mfrDrugData));
  }, []);

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


const handleApproveDiscount = async (drug: Drug) => {
    // setProductName(drugs[2].productNdc)
    setProductName(drug.productNdc)

                    // Handle drug selection
                    // alert(`Selected drug: ${selectedDrug.drugName}`);
                    // let drug = drugs[2];
                    if ( sellingPrice != '' && ! isNaN(Number(sellingPrice)) ) {
                      drug.pricing.price = Number(sellingPrice);
                      drug.pricing.lastUpdated = new Date().toLocaleDateString();
                      setApprovalRequired(true);
                      // alert(JSON.stringify(drug));
                      // localStorage.setItem('MfrDrugData', JSON.stringify(drug));
                      } else {
                      drug.pricing.price = manHistData[2].price;
                      drug.pricing.lastUpdated = manHistData[2].date;
                      setApprovalRequired(false);
                    }
                    // localStorage.setItem('MfrDrugData', JSON.stringify(drug));
                    setSelectedDrug(drug)
                    setPickedDrug(drug);
                    // setSelectedDrugList(oldArray => [...oldArray,selectedDrug] );
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



  const [showGrid, setShowGrid] = useState(false);

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSellingPrice(value)
    setDiscountPercentage(value)
    
    if (value === '') {
      setError('')
      return
    }

    const num = Number(value)
    if (isNaN(num)) {
      setError('Please enter a valid number')
    } else {
      setError('')
    }
  }

  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.trim()) {
        setLoading(true);
        try {
          const response = await searchDrugs(query);
          setDrugs(response.results);
        } catch (error) {
          console.error('Error searching drugs:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setDrugs([]);
      }
    }, 500),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handleDrugSelect = (drug: Drug) => {
    setShowGrid(false);
    if ( mfrDrugData && drug.drugName === mfrDrugData.drugName ) {
            let pr : PriceEntry = {price: mfrDrugData.pricing.price, date: mfrDrugData.pricing.lastUpdated};
            let prArray : PriceEntry[] = [pr, pr, pr];
            setManHistData(prArray);

    } else {
        if ( storedData && storedData.length > 0 ) {
            const histData = storedData.filter( ( hist ) =>  {
             return hist.drugName === drug.drugName
            });
            if (histData[0].history.length > 0 ) {
              setManHistData(histData[0].history);
            }
      
          }
    }
  
    setSelectedDrug(drug);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Insurance
        </h1>
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Drug Information Search
        </h1>
        
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search for a drug..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {loading && (
          <div className="text-center text-gray-600">Loading...</div>
        )}

        {pickedDrug?.drugName && pickedDrug?.drugName.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Picked Drug</h2>
            <div className="space-y-4">
                <div
                  key={pickedDrug?.productNdc}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  // onClick={() => handleDrugSelect(drug)}
                >
                  <h3 className="font-medium text-lg">{pickedDrug?.drugName}</h3>
                  <p className="text-sm text-gray-600">
                    <ul>Manufacturer: {pickedDrug?.manufacturerName}</ul>
                    <ul>Price : {pickedDrug?.pricing.price}</ul>
                    <ul>Price Updated Date : {pickedDrug?.pricing.lastUpdated}</ul>
                    <ul>Mfr Approval Required: {approvalRequired?'Yes':'No'}</ul>
                  </p>
                </div>
            </div>
          </div>
        )}

        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Search Results</h2>
            <div className="space-y-4">
              {drugs.map((drug) => (
                <div
                  key={drug.productNdc}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleDrugSelect(drug)}
                >
                  <h3 className="font-medium text-lg">{drug.drugName}</h3>
                  <p className="text-sm text-gray-600">
                    Manufacturer: {drug.manufacturerName}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Drug Details</h2>
            {selectedDrug ? (
              <div className="space-y-4">
                <h3 className="text-xl font-medium">{selectedDrug.drugName}</h3>
                <h3 className="text-xl font-medium">Ndc: {selectedDrug.productNdc}</h3>
                <div>
                  <p className="font-medium">Active Ingredients:</p>
                  <ul className="list-disc pl-5">
                    {selectedDrug.activeIngredients.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-medium">Dosage Form:</p>
                  <p>{selectedDrug.dosageForm}</p>
                </div>
                <div>
                  <p className="font-medium">Strength:</p>
                  <p>{selectedDrug.strength}</p>
                </div>
                <div>
                  <p className="font-medium">Description:</p>
                  <p>{selectedDrug.description}</p>
                </div>
                <div>
                  <p className="font-medium">Manufacturer:</p>
                  <p>{selectedDrug.manufacturerName}</p>
                </div>
                <div>
                  <p className="font-medium">Selling Price:</p>
                  <p>{manHistData[2].price}</p>
                </div>
                <div>
                  <p className="font-medium">Discount %</p>
                  {/* <div className="mb-8"> */}
                    <input
                      type="text"
                      placeholder="Discount %"
                      value={sellingPrice}
                      onChange={handleNumberChange}
                      className="w-30 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {error && (
                      <p className="text-red-500 text-sm">{error}</p>
                    )}
                  {/* </div> */}
                  <span className='ml-10'>
                  <NativeSelect
                        defaultValue={30}
                        inputProps={{
                        name: 'Tier',
                        id: 'tierid',
                        }}
                        >
                        <option value={1}>Tier 1</option>
                        <option value={2}>Tier 2</option>
                        <option value={3}>Tier 3</option>
                        <option value={4}>Tier 4</option>
                    </NativeSelect>

                  </span>
                </div>
                <div className="max-w-4xl mx-auto">
                    <button
                      onClick={() => setShowGrid(!showGrid)}
                      className="mb-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                      {showGrid ? 'Hide' : 'History'}
                    </button>

                    {showGrid && <Grid items={manHistData} />}
                  </div>
                <button
                  className="w-full bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => handleApproveDiscount(selectedDrug)}

                //   onClick={() => {
                //     // Handle drug selection
                //     // alert(`Selected drug: ${selectedDrug.drugName}`);
                //     let drug = selectedDrug;
                //     if ( sellingPrice != '' && ! isNaN(Number(sellingPrice)) ) {
                //       drug.pricing.price = Number(sellingPrice);
                //       drug.pricing.lastUpdated = new Date().toLocaleDateString();
                //       setApprovalRequired(true);
                //       // alert(JSON.stringify(drug));
                //       // localStorage.setItem('MfrDrugData', JSON.stringify(drug));
                //       } else {
                //       drug.pricing.price = manHistData[2].price;
                //       drug.pricing.lastUpdated = manHistData[2].date;
                //       setApprovalRequired(false);
                //     }
                //     // localStorage.setItem('MfrDrugData', JSON.stringify(drug));
                //     setSelectedDrug(drug)
                //     setPickedDrug(drug);
                //     // setSelectedDrugList(oldArray => [...oldArray,selectedDrug] );
                //   }}
                >
                  Approve Discount
                </button>
              </div>
              
            ) : (
              <p className="text-gray-600">Select a drug to view details</p>
            )}
          </div>
          {/* {pickedDrug?.drugName && pickedDrug?.drugName.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Picked Drug</h2>
            <div className="space-y-4">
                <div
                  key={pickedDrug?.productNdc}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  // onClick={() => handleDrugSelect(drug)}
                >
                  <h3 className="font-medium text-lg">{pickedDrug?.drugName}</h3>
                  <p className="text-sm text-gray-600">
                    <ul>Manufacturer: {pickedDrug?.manufacturerName}</ul>
                    <ul>Price : {pickedDrug?.pricing.price}</ul>
                    <ul>Price Updated Date : {pickedDrug?.pricing.lastUpdated}</ul>
                    <ul>Mfr Approval Required: {approvalRequired?'Yes':'No'}</ul>
                  </p>
                </div>
            </div>
          </div>
        )} */}
          
          {/* <div >
          <h2 className="text-xl font-semibold mb-4">Selected List</h2>
          <ul className="list-disc pl-5">
                    {selectedDrugList.map((drug, index) => (
                      <li key={index}>{drug.drugName}</li>
                    ))}
                  </ul>
 
          </div> */}
        </div>
      </div>
    </div>
  );
} 