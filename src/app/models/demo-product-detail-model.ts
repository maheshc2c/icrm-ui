export interface DemoProductDetailModel {
  //   demoProductDetailId: number;
  // demoProductDetailSerialNumber: string;
  // demoProductDetailBranchId: number;
  // demoProductDetailCityId: number;
  // demoProductDetailLocation: string;
  // demoProductDetailStatus: number;
  // demoProductDetailCreatedBy: number;
  // demoProductDetailCreatedTime: string;
  // demoProductDetailModifiedBy: number | null;
  // demoProductDetailModifiedTime: string | null;
 demoProductDetailId: number;
  demoProductDetailSerialNumber: string;
  demoProductDetailLocation: string;
  demoProductDetailStatus: number;

  categoryName: string;
  groupName: string;
  productName: string;
  regionName: string;
  branchName: string;
  cityName: string;

  demoProductDetailCreatedBy: number;
  demoProductDetailCreatedTime: string;
  demoProductDetailModifiedBy: number | null;
  demoProductDetailModifiedTime: string | null;
}
