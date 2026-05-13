export interface PlanVisitModel {
  visitId: number;
  leadId: number;
  purposeId: number;
  purposeName: string;
  startDate: string;
  endDate: string;
  status: number;
  remarks1: string;
  remarks2: string;
  remarks3: string | null;
  createdBy: number;
  createdTime: string;
  modifiedBy: number;   // ✅ FIXED
  modifiedTime: string;
}