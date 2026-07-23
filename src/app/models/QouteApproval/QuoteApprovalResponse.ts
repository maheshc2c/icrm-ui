export interface QuoteApprovalResponse {
  quoteId: string;
  quoteNumber: string;
  quoteCreatedDate: string;

  customerName: string;
  salesEngineer: string;
  opportunityDetails: string;

  orderValue: number;
  discount: number;

  finalApprover: string;
  currentStage: string;

  canApprove: boolean;
  quoteRevisionId: number;
  canView: boolean;

  requiredQuantity: string;

  approvedByCurrentUser: boolean;

  quoteRemarks1: string;
  quoteRemarks2: string;
  quoteRemarks3: string;

  quoteCreatedTime: string; // ISO DateTime from Spring Boot

  quoteDisplay: string;
}