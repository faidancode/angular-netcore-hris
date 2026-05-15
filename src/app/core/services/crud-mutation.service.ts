import { inject } from "@angular/core";
import { ApiResponse } from "../types/api.types";
import { BaseApiService } from "./base-api.service";

export abstract class CrudMutationService<
    TEntity,
    TCreatePayload = any,
    TUpdatePayload = TCreatePayload,
> {
    protected api = inject(BaseApiService);

    protected abstract endpoint: string;

    create(payload: TCreatePayload) {
        return this.api.post<ApiResponse<TEntity>>(
            this.endpoint,
            payload,
        );
    }

    update(id: string, payload: TUpdatePayload) {
        return this.api.patch<ApiResponse<TEntity>>(
            `${this.endpoint}/${id}`,
            payload,
        );
    }

    remove(id: string) {
        return this.api.delete(`${this.endpoint}/${id}`);
    }
}