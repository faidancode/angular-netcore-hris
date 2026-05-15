import { Injectable } from "@angular/core";
import { CreateRoleRequest, RoleDto, UpdateRoleRequest } from "../../types/role.types";
import { CrudMutationService } from "../crud-mutation.service";

@Injectable({
    providedIn: 'root',
})
export class RoleMutationService extends CrudMutationService<
    RoleDto,
    CreateRoleRequest,
    UpdateRoleRequest
> {
    protected override endpoint = '/roles';
}