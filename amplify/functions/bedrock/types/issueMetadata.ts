import { getTemplate } from "../helpers/github/issues/getTemplate"
export interface IssueMetadata {
    action: string,
    number: number,
    title: string,
    description: string,
    url: string,
    creator: string,
    isTicketOwner: boolean,
    repositoryName: string,
    labels: string[],
    template: ReturnType<typeof getTemplate>
    ticketOwnerComments?: string[]
    aiAssistantComments?: string[]
};
