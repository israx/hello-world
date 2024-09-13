import { Response } from "../../types";

export function isResponse(result: any): result is Response {
    return result && typeof result === 'object'
        && result.type && result.response;
}

