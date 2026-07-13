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
  customerName?: string;
  contactId: number;
  contactFirstName?: string;
  contact2Id?: number | null;
  
  sourceId?: number;
  sourceName?: string;
  campaignId?: number;
  campaignName?: string;
  siteReadinessId?: number;
  siteReadinessName?: string;
  distributorId?: number;
  distributorName?: string;
  relationshipId?: number;
  relationshipName?: string;
  
  username?: string;
  
  // Old fields used in some places
  leadPurchasePotential?: number;
  leadVisitRequirement?: number;
  leadResourceRequirement?: number;
  leadCmdLine1?: string;
  leadCmdLine2?: string;
  leadCmdLine3?: string;
  
  // New fields from LeadDetailsDTO
  purchasePotential?: number;
  visitRequirement?: boolean;
  resourceRequirement?: boolean;
  remarks1?: string;
  remarks2?: string;
  
  leadStatus?: number;
  leadCreatedTime?: string;
  leadModifiedTime?: string;
}