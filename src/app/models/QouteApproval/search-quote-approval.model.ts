export interface SearchQuoteApproval {

    quoteId?: string;

    opportunityDetails?: string;

    pagination: {

        pageNumber: number;

        pageSize: number;

        sortBy: string;

        sortOrder: string;

    };

}