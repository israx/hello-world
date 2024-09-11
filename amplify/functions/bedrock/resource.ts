import { defineFunction } from "@aws-amplify/backend";

export const ghIssueLambda = defineFunction({
    name: 'gh-issue-lambda-resolver',
    timeoutSeconds: 20,
    environment: {
        GITHUB_WEBHOOK_SECRET: '*******',
        GITHUB_TOKEN: '******',
    }
})
