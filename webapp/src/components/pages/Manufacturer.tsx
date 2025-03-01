import React, { useState, useCallback, useEffect } from 'react';
import { Drug } from '../types/Drug';
import { searchDrugs } from '../services/drugApi';
import debounce from 'lodash/debounce';
import Grid from './Grid';
import { Button } from '@mui/material';
import { DrugRegistration } from './DrugRegistration';

export default function Manufacturer() {
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

  interface PriceEntry {
    price: number;
    date: string;
  }
  
  interface StorageData {
    drugName: string;
    history: PriceEntry[];
  }

  const [storedData, setStoredData] = useState<StorageData[]>();

  useEffect(() => {
    localStorage.removeItem('MfrDrugData');
    // Load data from localStorage when component mounts
    const savedData = localStorage.getItem('manHistData');
    if (savedData) {
      setStoredData(JSON.parse(savedData));
    }
  }, []);



  const [showGrid, setShowGrid] = useState(false);

  // const manHistData2 = [
  //   { price: 99.99, date: '2024-02-26' },
  //   { price: 149.99, date: '2024-02-25' },
  //   { price: 199.99, date: '2024-02-24' },
  // ];


  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSellingPrice(value)
    
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

  // const handleSellingPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const query = e.target.value;
  //   setSellingPrice(query);
  // };

  const handleDrugSelect = (drug: Drug) => {
    setShowGrid(false);
    if ( storedData && storedData.length > 0 ) {
      const histData = storedData.filter( ( hist ) =>  {
       return hist.drugName === drug.drugName
      });
      if (histData[0].history.length > 0 ) {
        setManHistData(histData[0].history);
      }
      // alert(JSON.stringify(storedData));

      // alert(JSON.stringify(histData));
      // alert(JSON.stringify(manHistData));

    }
  
    setSelectedDrug(drug);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Manufacturer
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
                    <ul>Ins Approval Required: {approvalRequired?'Yes':'No'}</ul>
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
                  <p className="font-medium">Current Price:</p>
                  <p>{manHistData[2].price}</p>
                </div>
                <div>
                  <p className="font-medium">Selling Price:</p>
                  <div className="mb-8">
                    <input
                      type="text"
                      placeholder="Price..."
                      value={sellingPrice}
                      onChange={handleNumberChange}
                      className="w-20 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {error && (
                      <p className="text-red-500 text-sm">{error}</p>
                    )}

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

                  {/* <p>${selectedDrug.pricing.price.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">
                    Last updated: {new Date(selectedDrug.pricing.lastUpdated).toLocaleDateString()}
                  </p> */}
                </div>
                <button
                  className="w-full bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => {
                    // Handle drug selection
                    // alert(`Selected drug: ${selectedDrug.drugName}`);
                    let drug = selectedDrug;
                    if ( sellingPrice != '' && !isNaN(Number(sellingPrice)) ) {
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
                    localStorage.setItem('MfrDrugData', JSON.stringify(drug));
                    setSelectedDrug(drug)
                    setPickedDrug(drug);
                    // setSelectedDrugList(oldArray => [...oldArray,selectedDrug] );
                  }}
                >
                  Choose Drug
                </button>
                {selectedDrug && (
                  <DrugRegistration drug={selectedDrug} />
                )}
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
                    <ul>Ins Approval Required: {approvalRequired?'Yes':'No'}</ul>
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