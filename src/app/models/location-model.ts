export interface LocationModel {

     locationId: number;
  locationName: string;
  territoryLevelId: number;
  parentId: number;
  locationStatus: number;
  locationCreatedBy: number;
  locationCreatedTime: string;
  locationModifiedBy: number | null;
  locationModifiedTime: string | null;
}
