export interface District {
  id?: number;
  districtName: string;
  geoId?: number;
  countryId?: number;
  regionId?: number;
  stateId?: number;
  territoryLevelId?: number;
  status?: number;
  createdBy?: any;
  createdTime?: string;
  modifiedBy?: any;
  modifiedTime?: string | null;
}