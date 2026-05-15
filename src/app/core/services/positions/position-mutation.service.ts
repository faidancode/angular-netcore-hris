import { Injectable } from "@angular/core";
import { Position, PositionPayload } from "../../types/api.types";
import { CrudMutationService } from "../crud-mutation.service";

@Injectable({ providedIn: 'root' })
export class PositionMutationService extends CrudMutationService<
    Position,
    PositionPayload
> {
    protected override endpoint = '/positions';
}