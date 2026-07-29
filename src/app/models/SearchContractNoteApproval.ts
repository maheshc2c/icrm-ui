export interface SearchContractNoteApproval {

  contractNoteId?: number | null;

  cnoteType?: 'REGULAR' | 'PURCHASE_ORDER' | null;

  customerName?: string;

  pagination: {

    pageNumber: number;

    pageSize: number;

    sortBy: string;

    sortOrder: string;

  };

  

}