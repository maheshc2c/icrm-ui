export interface Country
{
  id?: number;
  countryName: string;
  countryCode?: string;
  territoryLevelId?: number;
  status?: number;
  createdBy?: any;
  createdTime?: string;
  modifiedBy?: any;
  modifiedTime?: string | null;
}