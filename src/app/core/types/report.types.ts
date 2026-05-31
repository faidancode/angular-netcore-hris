export type ReportExportFormat = 'xlsx' | 'pdf';

export interface ReportBreakdownItem {
  id?: string;
  name?: string;
  label?: string;
  total?: number;
  count?: number;
}

export interface EmployeeReportSummary {
  totalEmployees: number;
  totalActiveEmployees: number;
  totalInactiveEmployees: number;
  totalPermanentEmployees: number;
  totalContractEmployees: number;
  totalMaleEmployees: number;
  totalFemaleEmployees: number;
  totalByDepartment: ReportBreakdownItem[];
  totalByPosition: ReportBreakdownItem[];
  totalByEmployeeStatus: ReportBreakdownItem[];
}

export interface EmployeeReportItem {
  id: string;
  fullName: string;
  nip: string;
  gender: string;
  employmentType: string;
  employeeStatus: string;
  isActive: boolean;
  departmentId: string;
  departmentName: string;
  positionId: string;
  positionName: string;
  dateOfJoining: string;
  createdAt: string;
}

export interface EmployeeReport {
  summary: EmployeeReportSummary;
  items: EmployeeReportItem[];
}

export interface EmployeeReportFilters {
  departmentId?: string;
  positionId?: string;
  employeeId?: string;
  employeeStatus?: string;
  employmentType?: string;
  isActive?: boolean;
  gender?: string;
  fromDate?: string;
  toDate?: string;
}

export interface AttendanceReportSummary {
  totalAttendances: number;
  totalOnTime: number;
  totalLate: number;
  totalByStatus: ReportBreakdownItem[];
  totalByEmployee: ReportBreakdownItem[];
  totalByDate: ReportBreakdownItem[];
}

export interface AttendanceReportItem {
  id: string;
  date: string;
  employeeId: string;
  employeeName: string;
  employeeNip: string;
  checkIn: string;
  checkOut: string;
  status: string;
  createdAt: string;
}

export interface AttendanceReport {
  summary: AttendanceReportSummary;
  items: AttendanceReportItem[];
}

export interface AttendanceReportFilters {
  employeeId?: string;
  status?: string;
  date?: string;
  fromDate?: string;
  toDate?: string;
}
