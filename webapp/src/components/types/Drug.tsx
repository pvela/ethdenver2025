export interface Drug {
    drugName: string;
    activeIngredients: string[];
    dosageForm: string;
    description: string;
    strength: string;
    manufacturerName: string;
    pricing: {
      price: number;
      lastUpdated: string;
    };
    productNdc: string;
    approvalRequired: boolean;
  }
  
  export interface SearchResponse {
    results: Drug[];
    total: number;
  } 