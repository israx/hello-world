import { InvokeModelCommandInput, InvokeModelCommand, BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';
import { Octokit } from '@octokit/rest';
import crypto from 'crypto';

interface GhIssueMetadata {
    action: string,
    number: number,
    title: string,
    description: string,
    url: string,
    creator: string,
    isTicketOwner: boolean,
    repositoryName: string,
    labels: string[]
    ticketOwnerLastComment: string
    aiAssistantLastComment: string
};

const calculateSignature = (payload: any, secret: string) => {
    const hmac = crypto.createHmac('sha256', secret);
    const signature = hmac.update(payload).digest('hex');
    return `sha256=${signature}`;
}

export const getGhIssueMetadata = async (event: any): Promise<GhIssueMetadata> => {

    // Verify GitHub webhook signature
    const githubSignature = event.headers['X-Hub-Signature-256'] || event.headers['x-hub-signature-256'];
    const calculatedSignature = calculateSignature(event.body, process.env.GITHUB_WEBHOOK_SECRET ?? '');

    // if (githubSignature !== calculatedSignature) {
    //     throw Error('Invalid signature')
    // }


    // Parse the webhook payload
    const payload = JSON.parse(event.body);
    console.log(JSON.stringify(payload, null, 2));
    // Check if this is an issue event

    if (payload.issue) {
        const commentsUrl = payload.issue?.comments_url;
        const comments = commentsUrl ? await fetchGitHubComments(commentsUrl) : []
        const aiAssistantComments = comments.filter(comment => comment.author_association === 'OWNER').map(comment => comment.body);
        const ticketOwnerComments = comments.filter(comment => comment.user.login === payload.issue.user.login).map(comment => comment.body)
        const issueMetadata = {
            action: payload.action,
            number: payload.issue.number,
            title: payload.issue.title,
            description: payload.issue.body,
            url: payload.issue.html_url,
            creator: payload.issue.user.login,
            repositoryName: payload.repository.full_name,
            labels: payload.issue.labels?.map((label: { name: string; }) => label.name) ?? [],
            isTicketOwner: payload.comment.user.login === payload.issue.user.login,
            aiAssistantLastComment: aiAssistantComments[aiAssistantComments.length -1] ,
            ticketOwnerLastComment: ticketOwnerComments[ticketOwnerComments.length -1]
        };

        return issueMetadata;
    }

    throw new Error('no issue metada obtained');
}


export async function commentOnIssue({ number, repositoryName }: GhIssueMetadata, response: string) {
    const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN
    });

    const [owner, repo] = repositoryName.split('/');
    await octokit.issues.createComment({
        owner,
        repo,
        issue_number: number,
        body: response
    });
}

async function addLabel({ number, repositoryName }: GhIssueMetadata, label: string) {
    const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN
    });

    const [owner, repo] = repositoryName.split('/');

    await octokit.issues.addLabels({
        owner,
        repo,
        issue_number: number,
        labels: [label]
    });
}

export async function processIssue(issueMetadata: GhIssueMetadata): Promise<string> {

    const responseType = await determineResponseType(issueMetadata);
    console.log("response type:", responseType)

    if (responseType.includes('CLARIFICATION_NEEDED') || responseType.includes('INSUFFICIENT_INFO')) {
        return await askClarifyingQuestions(issueMetadata);
    } else if (responseType.includes('ISSUE_SOLVED')) {
        await addLabel(issueMetadata, 'solved')
        return "I'm glad to hear you've solved the issue. Thank you for updating us. Is there anything else you need help with?";
    } else if (responseType.includes('PROVIDE_WORKAROUND')) {
        return provideWorkaround(issueMetadata);
    } else {
        await addLabel(issueMetadata, 'pending-maintainer-response');
        return "I'm having trouble understanding the current state of your issue. A maintainer will review it shortly.";
    }

}

async function determineResponseType({ title, description, ticketOwnerLastComment }: GhIssueMetadata) {
    const prompt = `
   First, analyze the "Issue title", "Issue content", "Ticket owner comment" provided below. 
   Second, determine the appropriate response type. Respond with only one of these options: CLARIFICATION_NEEDED, ISSUE_SOLVED, PROVIDE_WORKAROUND, or INSUFFICIENT_INFO.
  
        Issue title: ${title}
        Issue content:${JSON.stringify(description)}
        Ticket owner comment:  ${ticketOwnerLastComment}
`;
    console.log('response type propmt', prompt)
    const response = await generateBedrockResponse(prompt);
    return response.trim();
}


async function askClarifyingQuestions({ title, description, ticketOwnerLastComment }: GhIssueMetadata) {
    const prompt = `
    First analyze the Issue title, Issue content, Ticket owner comment below. 

    Then, based on the collected information ask clarifying questions about the following issue. Be concise and specific.

        Issue title: ${title}
        Issue content:${JSON.stringify(description)}
        Ticket owner comment:  ${ticketOwnerLastComment}
    `;

    return generateBedrockResponse(prompt);
}


async function provideWorkaround({ title, description, ticketOwnerLastComment }: GhIssueMetadata) {
    const prompt = `provide a workaround for the following issue. Be concise and specific:
   
        Issue title: ${title}
        Issue content:${JSON.stringify(description)}
        Ticket owner comment:  ${ticketOwnerLastComment}
    `;
    return generateBedrockResponse(prompt);
}


export async function generateBedrockResponse(prompt: string): Promise<string> {
    const bedrock = new BedrockRuntimeClient({ region: "us-east-1" });
    const params: InvokeModelCommandInput = {
        modelId: "anthropic.claude-3-5-sonnet-20240620-v1:0",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
            anthropic_version: "bedrock-2023-05-31",
            system: `
            You are an AI assistant for the AWS Amplify JS team. 

            Your job is to provide clear and concise answers that help customers troubleshoot their issues, or to get more clariying questions.

            You have expertice in:
            1. Front-end technologies such as React, Next JS, Angular, Vue
            2. AWS Cognito
            3. AWS AppSync
            4. AWS IAM
            5. AWS S3
            6. AWS Amplify
            7. Software development
            `,
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: prompt,
                        },
                    ],
                },
            ],
            max_tokens: 1000,
            temperature: 0.5,
        }),
    };

    const command = new InvokeModelCommand(params);
    const response = await bedrock.send(command);
    // Decode and return the response(s)
    const decodedResponseBody = new TextDecoder().decode(response.body);
    /** @type {MessagesResponseBody} */
    const responseBody = JSON.parse(decodedResponseBody);
    return responseBody.content[0].text;
}

async function fetchGitHubComments(url: string): Promise<any[]> {

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Fetched data:', data);
    return data;
}
