export interface State {
  id?: number;
  stateName: string;
  geoId?: number;
  countryId?: number;
  regionId?: number;
  territoryLevelId?: number;
  status?: number;
  createdBy?: any;
  createdTime?: string;
  modifiedBy?: any;
  modifiedTime?: string | null;
}