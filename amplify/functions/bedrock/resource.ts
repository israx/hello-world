import { defineFunction } from "@aws-amplify/backend";

export const ghIssueLambda = defineFunction({
    name: 'issue-lambda-resolver',
    timeoutSeconds: 60,
    memoryMB: 1024,
    environment: {
        GITHUB_TOKEN: '',
    }
})
