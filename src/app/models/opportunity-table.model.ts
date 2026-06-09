export interface OpportunityTableModel {
  sno?: number;
  id: number;
  leadDetails: string | null;
  productAndCategory: string | null;
  qty: number | null;
  stage: string | null;
  category: string | null;
  probability: number | null;
  lifeTimeDays: number | null;
  product?: string | null;
  lifeTime?: number | null;
  value?: number | null;
}