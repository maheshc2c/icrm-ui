export interface Product {
  productId: number;
  productGroupId: number;
  productName: string;
  productSecondaryName: string | null;
  productDescription: string;
  productFeatures: string;
  productScope: string;
  productMrp: number;
  productOldMrp: number;
  productBasePrice: number;
  productEd: number;
  productVat: number;
  productFreightInsurance: number;
  productGst: number;
  productRrp: number;
  productDp: number;
  productTarget: number;
  productRank: number | null;
  productAvailability: number;
  productStatus: number;
  productCreatedByUserId: number;
  productCreatedTime: string;
  productModifiedByUserId: number;
  productModifiedTime: string;
  productQuantity: number;
  asOnDate: string;
  group: ProductGroup;
  productType: ProductType;
  subCategory: SubCategory;
}
 
export interface ProductGroup {
  groupId: number;
  groupName: string;
  productCategoryId: number;
  groupDescription: string;
  groupRank: number;
  groupWeight: number;
  groupStatus: number;
  groupCreatedByUserId: number;
  groupCreatedDateTime: string;
  groupModifiedByUserId: number;
  groupModifiedDateTime: string;
  category: Category;
}
 
export interface Category {
  categoryId: number;
  companyId: number;
  categoryName: string;
  categoryDescription: string;
  categoryStatus: number;
  categoryCreatedBy: number;
  categoryCreatedTime: string;
  categoryModifiedBy: number;
  categoryModifiedTime: string;
}
 
export interface ProductType {
  productTypeId: number;
  typeName: string;
}
 
export interface SubCategory {
  subcategoryId: number;
  subcategoryName: string;
  subcategoryModifiedBy: number | null;
  subcategoryModifiedTime: string | null;
  subcategoryCreatedTime: string;
  subcategoryCreatedBy: number;
  subcategoryStatus: number;
}
 
export interface ProductDto {
  productGroupId?: number;
  productName: string;
  productSecondaryName?: string;
  productDescription: string;
  productFeatures?: string;
  productScope?: string;
  productMrp?: number;
  productOldMrp?: number;
  productBasePrice?: number;
  productEd?: number;
  productVat?: number;
  productFreightInsurance?: number;
  productGst?: number;
  productRrp?: number;
  productDp?: number;
  productTarget?: number;
  productRank?: number;
  productAvailability?: number;
  productStatus?: number;
  productQuantity?: number;
}
 
 