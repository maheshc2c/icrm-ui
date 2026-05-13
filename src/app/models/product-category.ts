export interface ProductCategory {
  categoryId?: number;
  categoryName: string;
  categoryDescription: string;
  categoryStatus?: number;
  categoryCreatedBy?: number;
  categoryCreatedTime?: Date;
  categoryModifiedBy?: number;
  categoryModifiedTime?: Date;
  companyId?: number;
}