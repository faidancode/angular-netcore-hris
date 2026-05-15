import { Injectable } from "@angular/core";
import { Department, DepartmentPayload } from "../../types/api.types";
import { CrudMutationService } from "../crud-mutation.service";

@Injectable({ providedIn: 'root' })
export class DepartmentMutationService extends CrudMutationService<
    Department,
    DepartmentPayload
> {
    protected override endpoint = '/departments';
}