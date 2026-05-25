import { Injectable } from '@angular/core';
import {
  LeaveMaster,
  LeaveMasterCreatePayload,
  LeaveMasterUpdatePayload,
} from '../../types/api.types';
import { CrudMutationService } from '../crud-mutation.service';

@Injectable({
  providedIn: 'root',
})
export class LeaveMasterMutationService extends CrudMutationService<
  LeaveMaster,
  LeaveMasterCreatePayload,
  LeaveMasterUpdatePayload
> {
  protected override endpoint = '/leave-masters';
}
