export interface TrackLead {
  leadId: number;
  customerName: string;
  contactFirstName: string;
  createdBy: string;
  leadSource: string;
  createdTime: string;
  leadStatus: number;
}

export interface PaginationRequest {
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortOrder: string;
}

export interface TrackLeadResponse {
  content: TrackLead[];
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
}
