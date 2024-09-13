import { IssueBodyFields } from "../../../constants/issueBodyFields";

export const extractField = (text: string, fieldName: string) => {
    const regex = new RegExp(`${fieldName}\\s*\\n([\\s\\S]*?)(?:\\n\\n|\\Z)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : null;
};

export const getTemplate = (issueBody: string) => {
    return {
        [IssueBodyFields.JAVASCRIPT_FRAMEWORK]: extractField(issueBody, 'JavaScript Framework'),
        [IssueBodyFields.AMPLIFY_APIS]: extractField(issueBody, 'Amplify APIs'),
        [IssueBodyFields.AMPLIFY_VERSION]: extractField(issueBody, 'Amplify Version'),
        [IssueBodyFields.AMPLIFY_CATEGORIES]: extractField(issueBody, 'Amplify Categories'),
        [IssueBodyFields.BACKEND]: extractField(issueBody, 'Backend'),
        [IssueBodyFields.ENVIRONMENT_INFORMATION]: extractField(issueBody, 'Environment information'),
        [IssueBodyFields.DESCRIBE_THE_BUG]: extractField(issueBody, 'Describe the bug'),
        [IssueBodyFields.EXPECTED_BEHAVIOR]: extractField(issueBody, 'Expected behavior'),
        [IssueBodyFields.REPRODUCTION_STEPS]: extractField(issueBody, 'Reproduction steps'),
        [IssueBodyFields.CODE_SNIPPET]: extractField(issueBody, 'Code Snippet'),
        [IssueBodyFields.LOG_OUTPUT]: extractField(issueBody, 'Log output'),
        [IssueBodyFields.AWS_EXPORTS_JS]: extractField(issueBody, 'aws-exports.js'),
        [IssueBodyFields.MANUAL_CONFIGURATION]: extractField(issueBody, 'Manual configuration'),
        [IssueBodyFields.ADDITIONAL_CONFIGURATION]: extractField(issueBody, 'Additional configuration'),
        [IssueBodyFields.MOBILE_DEVICE]: extractField(issueBody, 'Mobile Device'),
        [IssueBodyFields.MOBILE_OPERATING_SYSTEM]: extractField(issueBody, 'Mobile Operating System'),
        [IssueBodyFields.MOBILE_BROWSER]: extractField(issueBody, 'Mobile Browser'),
        [IssueBodyFields.MOBILE_BROWSER_VERSION]: extractField(issueBody, 'Mobile Browser Version'),
        [IssueBodyFields.ADDITIONAL_INFORMATION_AND_SCREENSHOTS]: extractField(issueBody, 'Additional information and screenshots')
    };
}