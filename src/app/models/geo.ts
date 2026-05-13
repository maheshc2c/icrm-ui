export interface Geo {
  id?: number;
  locationId?: number; // Backend returns this
  locationName: string;
  territoryLevelId?: number;
  status?: number;
  locationStatus?: number; // Backend expects this
  createdBy?: any;
  createdTime?: string;
  modifiedBy?: any;
  modifiedTime?: string | null;
}