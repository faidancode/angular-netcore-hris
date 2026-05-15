import { Injectable } from "@angular/core";
import { Employee, EmployeePayload } from "../../types/api.types";
import { CrudMutationService } from "../crud-mutation.service";

@Injectable({ providedIn: 'root' })
export class EmployeeMutationService extends CrudMutationService<
    Employee,
    EmployeePayload
> {
    protected override endpoint = '/employees';
}