export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

export interface LostGroupDto {
  id: number;
  name: string;
  totalValueLakhs: number;
  percentage: number;
}

export interface LostDealsReportResponseDto {
  byReason: LostGroupDto[];
  byCompetitor: LostGroupDto[];
}

export interface LostRegionDto {
  regionId: number;
  regionName: string;
  totalValueLakhs: number;
}

export interface LostProductDto {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  totalValueLakhs: number;
}
