import { IssueMetadata, Response, Type } from "../../../types";
import { addComment } from "./addComment";
import { addLabel } from "./addLabel";
import { close } from "./close";
import { update } from "./update";

export async function triage(
    { response, type }: Response,
    metadata: IssueMetadata) {
    switch (type) {
        case "WORKAROUND":
        case "CLARIFYING_QUESTIONS":
            await addLabel(metadata, 'question');
            await addComment(
                metadata,
                response);
            break;
        case "UNABLE_TO_ANSWER":
            await addLabel(metadata, 'pending-maintainer-response');
            await addComment(
                metadata,
                response);
            break;
        case "SOLVED":
            await close(metadata);
            await addComment(
                metadata,
                "Thank you for raising this issue. If you have any questions or if this issue resurfaces, please don't hesitate to reopen it or create a new one.");
            break;
        case "INAPPROPRIATE":
            await update(metadata, { body: '' })
            await close(metadata);
            break
        default:
            await addComment(metadata, response);
            break
    }
}
