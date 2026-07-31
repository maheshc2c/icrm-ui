export interface GeneralSettingsResponse {
  status: boolean;
  message: string;
  data: GeneralSettingSection[];
  totalElements: number | null;
  totalPages: number | null;
}

export interface GeneralSettingSection {
  sectionId: number;
  sectionName: string;
  rank: number;
  preferences: GeneralSettingPreference[];
}

export interface GeneralSettingPreference {
  preferenceId: number;
  name: string;
  value: string;
  lable: string;
  section: any | null;
  type: number;
  rank: number;
  bdisplay: number;
}
