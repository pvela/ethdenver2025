import React, { useState, useCallback } from 'react';
import { Drug } from '../types/Drug';
import { searchDrugs } from '../services/drugApi';
import debounce from 'lodash/debounce';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);

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
    setSelectedDrug(drug);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
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

        <div className="grid gap-6 md:grid-cols-2">
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
                  <p className="font-medium">Pricing:</p>
                  <p>${selectedDrug.pricing.price.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">
                    Last updated: {new Date(selectedDrug.pricing.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
                <button
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => {
                    // Handle drug selection
                    alert(`Selected drug: ${selectedDrug.drugName}`);
                  }}
                >
                  Choose Drug
                </button>
              </div>
            ) : (
              <p className="text-gray-600">Select a drug to view details</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 