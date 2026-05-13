export interface UserlogModel {

    serialNo: number;
  name: string;
  role: string;
  employeeId: string;
  branch: string;

  loginTime: string;
  lastActive?: string | null;

  ipAddress: string;
  browser: string;

  token?: string; // optional (usually not shown in UI)
}
