export interface Role {
  id: number;
  roleName: string;
}

export interface CampaignDocument {
  campaignDocumentId: number;
  campaignDocName: string;
  campaignDocdescription: string;
  campaignDocpath: string;
  campaignDocstatus: number;
  campaignDoccreatedBy: number;
  campaignDoccreatedTime: string;
  campaignDocmodifiedBy: number;
  campaignDocmodifiedTime: string;
  role: Role[];
}
