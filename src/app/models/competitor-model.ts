export interface CompetitorModel {
  competitorId: number;     // optional (not needed while creating)
  competitorName: string;
  competitorRating: number;
// competitorRating: number | null;
  competitorStatus?: number;
  competitorCreatedBy?: number;
  competitorCreatedTime?: string;
  competitorModifiedBy?: number | null;
  competitorModifiedTime?: string | null;
}

