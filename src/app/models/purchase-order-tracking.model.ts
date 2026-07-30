export interface PurchaseOrderTrackingModel {
  sno: number;
  poId: number;
  distributor: string;
  productDetails: string;
  discount: string | number;
  currentStage: number | string;
  status: number | string;
  finalApprover: number | string;
  documents: number | string;
}
