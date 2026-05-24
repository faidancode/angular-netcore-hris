import { Injectable } from '@angular/core';
import {
  Attendance,
  AttendanceCreatePayload,
  AttendanceUpdatePayload,
} from '../../types/attendance.types';
import { CrudMutationService } from '../crud-mutation.service';

@Injectable({
  providedIn: 'root',
})
export class AttendanceMutationService extends CrudMutationService<
  Attendance,
  AttendanceCreatePayload,
  AttendanceUpdatePayload
> {
  protected override endpoint = '/attendances';
}
