import crypto from 'crypto';

interface GhIssueMetadata {
    action: string,
    issueNumber: string,
    issueTitle: string,
    issueBody: string,
    issueUrl: string,
    issueCreator: string,
    repositoryName: string,
};

const calculateSignature = (payload: any, secret: string) => {
    const hmac = crypto.createHmac('sha256', secret);
    const signature = hmac.update(payload).digest('hex');
    return `sha256=${signature}`;
}

export const getGhIssueMetadata = (event: any): GhIssueMetadata => {

    // Verify GitHub webhook signature
    const githubSignature = event.headers['X-Hub-Signature-256'] || event.headers['x-hub-signature-256'];
    const calculatedSignature = calculateSignature(event.body, process.env.GITHUB_WEBHOOK_SECRET ?? '');

    if (githubSignature !== calculatedSignature) {
        throw Error('Invalid signature')
    }


    // Parse the webhook payload
    const payload = JSON.parse(event.body);

    // Check if this is an issue event
    if (payload.issue) {
        const issueMetadata = {
            action: payload.action,
            issueNumber: payload.issue.number,
            issueTitle: payload.issue.title,
            issueBody: payload.issue.body,
            issueUrl: payload.issue.html_url,
            issueCreator: payload.issue.user.login,
            repositoryName: payload.repository.full_name,
        };

        console.log('Issue metadata:', JSON.stringify(issueMetadata, null, 2));

        return issueMetadata;
    }
    throw new Error('new issue metada obtained');
}

export function createPrompt(issueBody:string) {
    return `
  You are an AI assistant for the AWS Amplify JS team. Analyze GitHub issues and provide helpful responses. Here are some examples:
  
  Issue 1: "I'm getting a 'Cannot read property 'map' of undefined' error when using DataStore."
  Response 1: Thank you for reporting this issue. To help diagnose the problem, could you please provide the following information:
  1. Your aws-amplify version
  2. The full error stack trace
  3. A minimal code snippet that reproduces the issue
  4. The steps to reproduce the error
  
  Issue 2: "Feature request: Add support for custom authentication flows."
  Response 2: Thank you for your feature suggestion! We appreciate your input on improving Amplify. To better understand your needs:
  1. Can you describe your use case in more detail?
  2. What specific authentication flows are you looking to implement?
  3. How would this feature benefit your project?
  
  Now, please analyze and respond to this new issue:
  
  ${issueBody}
  
  Response:`;
  }