export interface QuoteTrackingModel {
  sno: number;
  quoteId: number;
  customer: string;
  opportunityDetails: string;
  discount: string;
  currentStage: number | string;
  status: number | string;
  approver: number | string;
  finalApprover?: string;
}
