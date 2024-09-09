import { defineBackend } from '@aws-amplify/backend';
import { ghIssueLambda } from './functions/bedrock/resource';
import { RestApi, LambdaIntegration, AuthorizationType } from 'aws-cdk-lib/aws-apigateway';
import { PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';


/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  ghIssueLambda
});

const ghIssueLambdaStack = backend.createStack('ghIssueLambdaStack');

// 1. Create API Gateway
const api = new RestApi(ghIssueLambdaStack, 'GhIssueApi', {
  restApiName: 'GitHub Issue API',
  description: 'This service handles GitHub issue webhooks.',
  defaultMethodOptions:
    { authorizationType: AuthorizationType.IAM },
});

const integration = new LambdaIntegration(backend.ghIssueLambda.resources.lambda);

api.root.addMethod('POST', integration);

// 2. Create policy for API Gateway to invoke Lambda
const apiGatewayRole = new Role(ghIssueLambdaStack, 'ApiGatewayRole', {
  assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
});

apiGatewayRole.addToPolicy(
  new PolicyStatement({
    resources: [backend.ghIssueLambda.resources.lambda.functionArn],
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