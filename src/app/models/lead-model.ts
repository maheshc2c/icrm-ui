export interface LeadSummary {
  leadId: number;
  customerName: string;
  contactFirstName: string;
  username: string;
  LeadStatus: number; // Keep for backward compatibility or DTO matching if needed, but we'll use lowercase leadStatus
  leadStatus: number;
  leadCreatedTime?: string;
  lifeTimeDays?: number;
  leadSource?: string;
  hasOpportunity?: boolean;
  hasQuote?: boolean;
  hasCNote?: boolean;
}
 
export interface LeadPayload {
  leadId?: number;
  customerId: number;
  contactId: number;
  customerName: string;
  contactFirstName: string;
  sourceName: string;
  campaignName?: string;
  siteReadinessName: string;
  distributorName: string;
  relationshipName: string;
  username: string;
  leadPurchasePotential: number;
  leadVisitRequirement: number;
  leadResourceRequirement: number;
  leadCmdLine1: string;
  leadCmdLine2?: string;
  leadCmdLine3?: string;
  leadStatus: number;
  leadCreatedTime?: string;
  leadModifiedTime?: string;
}