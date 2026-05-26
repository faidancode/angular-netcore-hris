import { Injectable } from '@angular/core';
import {
  LeaveAllowance,
  LeaveAllowanceCreatePayload,
  LeaveAllowanceUpdatePayload,
} from '../../types/api.types';
import { CrudMutationService } from '../crud-mutation.service';

@Injectable({
  providedIn: 'root',
})
export class LeaveAllowanceMutationService extends CrudMutationService<
  LeaveAllowance,
  LeaveAllowanceCreatePayload,
  LeaveAllowanceUpdatePayload
> {
  protected override endpoint = '/leave-allowances';
}
