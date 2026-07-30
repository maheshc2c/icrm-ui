export interface ChannelPartnerModel {

  channelPartnerId?: number;

  name: string;

  bankName?: string | null;

  bankAddress?: string | null;

  ifscCode?: string | null;

  accountType?: string | null;

  accountNumber?: number | null;


  city?: string | null;


  benificiaryName?: string | null;

  benificiaryAddress?: string | null;


  communicationAddress?: string | null;


  // Backend generated / response fields

  type?: number | null;

  companyId?: number | null;

  status?: number | null;


  createdBy?: number | null;

  createdTime?: string | null;

  modifiedBy?: number | null;

  modifiedTime?: string | null;

}