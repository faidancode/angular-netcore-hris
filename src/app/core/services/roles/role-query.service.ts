import { Injectable } from "@angular/core";
import { PaginatedQueryService } from "../paginated-query.service";
import { PermissionDto, RoleDto } from "../../types/role.types";
import { ApiResponse } from "../../types/api.types";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root',
})
export class RoleQueryService extends PaginatedQueryService<RoleDto> {
    protected override endpoint = '/roles';

    readonly roles = this.items;

    getPermissions(): Observable<ApiResponse<PermissionDto[]>> {
        return this.api.get<ApiResponse<PermissionDto[]>>(
            `${this.endpoint}/permissions`,
        );
    }
}