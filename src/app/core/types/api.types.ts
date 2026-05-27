export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface DashboardSummary {
  totalActiveEmployees: number;
  totalMaleEmployees: number;
  totalFemaleEmployees: number;
  totalPermanentEmployees: number;
  totalContractEmployees: number;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentPayload {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface Position {
  id: string;
  name: string;
  description?: string;
  departmentId: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PositionPayload {
  name: string;
  description?: string;
  departmentId: string;
  isActive?: boolean;
}

// --- Employee ---
export interface Employee {
  id: string;
  nip: string;
  fullName: string;
  gender: string;
  genderLabel: string;
  employeeStatus: string;
  employeeStatusLabel: string;
  positionId: string;
  positionName: string;
  isActive: boolean;
  isActiveLabel: string;
  dateOfJoining: string;
  dateOfActivePosition: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeePayload {
  nip: string;
  fullName: string;
  gender: string;
  positionId: string;
  employeeStatus: string;
  isActive: boolean;
  dateOfJoining?: string;
  dateOfActivePosition?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  roleId: string;
  roleName: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserPayload {
  name: string;
  email: string;
  roleId: string;
  password?: string;
  isActive?: boolean;
}

export interface LeaveMaster {
  id: string;
  name: string;
  code: string;
  quotaDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveMasterCreatePayload {
  name: string;
  code: string;
  quotaDays: number;
  isActive?: boolean;
}

export interface LeaveMasterUpdatePayload {
  name?: string;
  code?: string;
  quotaDays?: number;
  isActive?: boolean;
}

export interface LeaveAllowance {
  id: string;
  employeeId: string;
  employeeName?: string;
  leaveId: string;
  leaveName?: string;
  year: number;
  quotaDays: number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveAllowanceCreatePayload {
  employeeId: string;
  leaveId: string;
  year: number;
  quotaDays: number;
  notes?: string;
}

export interface LeaveAllowanceUpdatePayload {
  employeeId?: string;
  leaveId?: string;
  year?: number;
  quotaDays?: number;
  notes?: string;
}

export interface LeaveRequest {
  id: string;
  requestNo: string;
  employeeId: string;
  employeeName?: string;
  leaveId: string;
  leaveName?: string;
  fromDate: string;
  toDate: string;
  reason: string;
  attachmentPath?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveRequestCreatePayload {
  employeeId: string;
  leaveId: string;
  fromDate: string;
  toDate: string;
  reason: string;
  attachmentPath?: string;
}

export interface LeaveRequestUpdatePayload {
  employeeId?: string;
  leaveId?: string;
  fromDate?: string;
  toDate?: string;
  reason?: string;
  attachmentPath?: string;
}
