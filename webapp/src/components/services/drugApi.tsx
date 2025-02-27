import { Drug, SearchResponse } from '../types/Drug';

const FDA_API_BASE_URL = 'https://api.fda.gov/drug/ndc.json';

export const searchDrugs = async (query: string): Promise<SearchResponse> => {
  try {
    const response = await fetch(
      `${FDA_API_BASE_URL}?search=brand_name:"${query}"&limit=10`
    );
    const data = await response.json();

    const manHistArray = [{}];
    
    localStorage.removeItem('manHistData');

    
    const results: Drug[] = data.results.map((result: any) => ({

      drugName: result.brand_name,
      activeIngredients: result.active_ingredients?.map((ingredient: any) => ingredient.name) || [],
      dosageForm: result.dosage_form,
      description: result.packaging?.[0]?.description || 'No description available',
      strength: result.active_ingredients?.[0]?.strength || 'Not specified',
      manufacturerName: result.labeler_name,
      pricing: {
        price: Math.random() * 100 + 10, // Simulated price since FDA API doesn't provide pricing
        lastUpdated: new Date().toISOString(),
      },
      productNdc: result.product_ndc,
    }
));

results.map(( res: Drug ) => {
    
    const manHist = {
        drugName: res.drugName,
        history: [
         { price : res.pricing.price, date : '2024-01-01'},
         { price : res.pricing.price + 10, date : '2024-04-01'},
         { price : res.pricing.price + 13, date : '2024-05-01'},
         { price : res.pricing.price + 15, date : '2024-09-01'},
        ]
     }
     manHistArray.push(manHist);
 
});
    localStorage.setItem('manHistData', JSON.stringify(manHistArray));

    return {
      results,
      total: data.meta.results.total,
    };
  } catch (error) {
    console.error('Error fetching drug data:', error);
    return {
      results: [],
      total: 0,
    };
  }
}; 