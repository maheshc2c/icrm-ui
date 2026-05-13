export interface SpecialityModel {
  specialityId?: number;
  specialityName: string;
  specialityStatus?: number;
  specialityCreatedBy?: number;
  specialityCreatedTime?: string;
  specialityModifiedBy?: number | null;
  specialityModifiedTime?: string | null;
}