export interface QuoteViewModel {
  quoteId: number;
  quoteBillingInfoId: number;

  quoteDiscount: number | null;
  quoteSoNumber: string | null;
  quoteStockistId: number | null;

  quoteWarranty: number;
  quoteAdvanceType: number;
  quoteAdvance: number;

  quoteBalancePaymentDays: number | null;
  quoteDealerCommission: number | null;
  quoteDealerId: number | null;

  quoteStatus: number;

  quoteCreatedBy: number;
  quoteCreatedTime: string;

  quoteModifiedBy: number | null;
  quoteModifiedTime: string | null;

  quoteRemarks1: string | null;
  quoteRemarks2: string | null;
  quoteRemarks3: string | null;
  quoteRemarks4: string | null;
  quoteRemarks5: string | null;

  quoteChannelPartnerId: number;
  quoteCompanyId: number;

  billing: any | null;
}