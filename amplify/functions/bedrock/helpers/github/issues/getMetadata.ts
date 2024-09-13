import { IssueMetadata } from "../../../types";
import { filter } from "./filter";
import { getTemplate } from "./getTemplate";
import { fetchComments } from "./fetchComments";

export const getMetadata = async (event: any): Promise<IssueMetadata> => {

    console.log("event", event);
    // Parse the incoming event
    const payload = JSON.parse(event.body);

    if (!payload.issue) throw new Error("event doesn't contain issue")

    const issueTemplate = getTemplate(payload.issue.body)
    const issueComments = await fetchComments(payload.issue?.comments_url);

    const metadata: IssueMetadata = {
        action: payload.action,
        number: payload.issue.number,
        title: payload.issue.title,
        description: payload.issue.body,
        url: payload.issue.html_url,
        creator: payload.issue?.user?.login,
        repositoryName: payload.repository.full_name,
        labels: payload.issue.labels?.map((label: { name: string; }) => label.name) ?? [],
        isTicketOwner: payload.comment?.user?.login === payload.issue?.user?.login,
        template: issueTemplate
    }

    if (issueComments.length > 0) {

        const aiAssistantComments = filter(issueComments)(comment => comment.author_association === 'OWNER');
        const ticketOwnerComments = filter(issueComments)(comment => comment?.user?.login === payload.issue?.user?.login);
        metadata.aiAssistantComments = aiAssistantComments;
        metadata.ticketOwnerComments = ticketOwnerComments
    }

    // Extract fields from the issue body
    return metadata

}