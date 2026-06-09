export interface LocationInfo {
  locationId: number;
  territoryLevelId: number;
  locationName: string;
  parentId: number;
  locationStatus: number;
  locationCreatedBy: number;
  locationCreatedTime: string;
  locationModifiedBy: number | null;
  locationModifiedTime: string | null;
}

export interface SpecialityInfo {
  specialityId: number;
  specialityName: string;
  specialityStatus: number;
  specialityCreatedBy: number;
  specialityCreatedTime: string;
  specialityModifiedBy: number | null;
  specialityModifiedTime: string | null;
}

export interface Campaign {
  campaignId: number;
  campaignType: number;
  campaignName: string;
  campaignDescription: string;
  campaignDate: string;
  campaignSubject: string;
  campaignMailContent: string;
  campaignStatus: number;
  campaignCreatedBy: number;
  campaignCreatedTime: string;
  campaignModifiedBy: number | null;
  campaignModifiedTime: string | null;
  locationInfo: LocationInfo[];
  specialities: SpecialityInfo[];
}
