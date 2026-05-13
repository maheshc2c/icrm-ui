export interface Region
{
  id?: number;
  regionName: string;
  geoId?: number;
  countryId?: number;
  territoryLevelId?: number;
  status?: number;
  createdBy?: any;
  createdTime?: string;
  modifiedBy?: any;
  modifiedTime?: string | null;
}