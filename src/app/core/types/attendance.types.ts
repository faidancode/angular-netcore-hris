export type AttendanceStatus = 'OnTime' | 'Late';

export interface Attendance {
  id: string;
  date: string;
  employeeId: string;
  employeeName: string;
  employeeNip: string;
  checkIn: string;
  checkOut: string;
  status: AttendanceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceCreatePayload {
  date: string;
  employeeId: string;
  checkIn: string;
  checkOut: string;
}

export interface AttendanceUpdatePayload {
  date?: string;
  employeeId?: string;
  checkIn?: string;
  checkOut?: string;
}

export interface AttendanceListFilters {
  employeeId?: string;
  date?: string;
  fromDate?: string;
  toDate?: string;
}
