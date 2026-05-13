export interface ChannelPartnerModel {

     channelPartnerId: number;
  name: string;

  bankName?: string | null;
  bankAddress?: string | null;
  ifscCode?: string | null;
  accountType?: string | null;
  accountNumber?: number | null;

  city?: string | null;
  benificiaryAddress?: string | null;
  benificiaryName?: string | null;

  type?: number | null;
  companyId?: number | null;

  communicationAddress?: string | null;

  createdBy?: number | null;
  createdTime?: string | null;
  modifiedBy?: number | null;
  modifiedTime?: string | null;

  status?: number | null;
}
