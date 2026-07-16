export interface Project {
  id?: number | string;
  projectCode: string;
  projectName: string;
  description?: string;
  customer?: any;
  manager?: any;
  teamLead?: any;
  projectType?: string;
  priority?: string;
  healthMode?: string;
  health?: string;
  visibility?: string;
  status?: string;
  progressMode?: string;
  progress?: number;
  currency?: string;
  estimatedBudget?: number;
  estimatedHours?: number;
  expectedStartDate?: string;
  expectedEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  createdBy?: string;
}
