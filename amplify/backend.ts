import { defineBackend } from '@aws-amplify/backend';
import { ghIssueLambda } from './functions/bedrock/resource';
import { RestApi, LambdaIntegration, AuthorizationType } from 'aws-cdk-lib/aws-apigateway';
import { Effect, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';


/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  ghIssueLambda
});

const ghIssueLambdaStack = backend.createStack('ghIssueLambdaStack');
// 0. Grant lambda permission to call Bedrock
backend.ghIssueLambda.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions:["bedrock:InvokeModel"],
    resources: [
      `arn:aws:bedrock:*::foundation-model/anthropic.claude-3-5-sonnet-20240620-v1:0`,
    ],
  })
)
// 1. Create API Gateway
const api = new RestApi(ghIssueLambdaStack, 'GhIssueApi', {
  restApiName: 'GitHub Issue API',
  description: 'This service handles GitHub actions.',
  defaultMethodOptions:
    { authorizationType: AuthorizationType.NONE  },
});

const integration = new LambdaIntegration(backend.ghIssueLambda.resources.lambda);

api.root.addMethod('POST', integration);

// 2. Create policy for API Gateway to invoke Lambda
const apiGatewayRole = new Role(ghIssueLambdaStack, 'ApiGatewayRole', {
  assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
});

apiGatewayRole.addToPolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    resources: ['*'],
    actions: ['lambda:InvokeFunction'],
  })
);

backend.addOutput({
  custom:{
    apiGateway:{
      url: api.url
    
    }
  }
})