export interface QuoteApproval {

  quoteId: number;
  quoteRevisionId: number;

  customerName: string;
  salesEngineer: string;
  quoteNumber: string;
  opportunityDetails: string;

  orderValue: number;
  discount: number;

  currentStage: string;
  finalApprover: string;

  canApprove: boolean;
}