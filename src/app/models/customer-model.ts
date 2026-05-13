export interface CustomerModel {
  customerId: number;
  customerSalutation: string;
  customerName: string;
  customerName1: string;
  customerDepartment: string;
  customerDescription: string;
  customerEmail: string;
  customerTelephone: string;
  customerFax: string;
  customerMobile: string;
  customerWebsite: string;
  customerAddress1: string;
  customerAddress2: string;
  customerAddress3: string;
  customerLandmark: string;
  customerPincode: number;
  customerPan: string;
  customerTan: string;
  customerTin: string;
  customerRemarks1: string;
  customerRemarks2: string;
  customerType: number;
  customerStatus: number;
  customerCreatedBy: number;
  customerCreatedTime: string;
  customerModifiedBy: number | null;
  customerModifiedTime: string | null;
  customerCategory: CustomerCategory;
  subCategory: SubCategory;
  locations: Location[];
  cityName: string[];
}

/* ---------------- Sub Models ---------------- */

export interface CustomerCategory {
  customerCategoryId: number;
  customerCategoryName: string;
  customerCategoryStatus: number;
  customerCategoryCreatedBy: number;
  customerCategoryModifiedBy: number | null;
  customerCategoryCreatedTime: string;
  customerCategoryModifiedTime: string | null;
}

export interface SubCategory {
  subCategoryId: number;
  subcategoryName: string;
  subcategoryStatus: number;
  subcategoryCreatedBy: number;
  subcategoryCreatedTime: string;
  subcategoryModifiedBy: number | null;
  subcategoryModifiedTime: string | null;
}

export interface Location {
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


