import { Injectable } from "@angular/core";
import { User, UserPayload } from "../../types/api.types";
import { CrudMutationService } from "../crud-mutation.service";

@Injectable({ providedIn: 'root' })
export class UserMutationService extends CrudMutationService<
    User,
    UserPayload
> {
    protected override endpoint = '/users';
}