export interface Segment {
  groupId: number;
  groupName: string;
  productCategoryId: number;
  groupDescription: string;
  groupRank: number;
  groupWeight: number;
  groupStatus: number;
  groupCreatedByUserId: number;
  groupCreatedDateTime: string;
  groupModifiedByUserId: number;
  groupModifiedDateTime: string;
  category: SegmentCategory;
}
 
export interface SegmentCategory {
  categoryId: number;
  companyId: number;
  categoryName: string;
  categoryDescription: string;
  categoryStatus: number;
  categoryCreatedBy: number;
  categoryCreatedTime: string;
  categoryModifiedBy: number;
  categoryModifiedTime: string;
}
 
export interface SegmentDto {
  categoryId?: number;
  categoryName?: string;
  groupName: string;
  description?: string;
  groupDescription?: string;
  competitorNames?: string[];
  competitorIds?: number[];
  groupRank?: number;
  groupWeight?: number;
  groupStatus?: number;
}
 
 
export interface Competitor {
  competitorId: number;
  competitorName: string;
  competitorRating: number;
  competitorStatus: number;
  competitorCreatedBy: number;
  competitorCreatedTime: string;
  competitorModifiedBy: number;
  competitorModifiedTime: string;
}