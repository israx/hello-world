import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import axios from 'axios';
import { createPrompt, getGhIssueMetadata } from "./helpers";

const bedrock = new BedrockRuntimeClient({ region: "us-east-1" }); // replace with your region

export const handler = async (event:any) => {
  try {
    // Extract issue metadata from the event
    const metadata = getGhIssueMetadata(event);

    // Get relevant information and create prompt
    const prompt = createPrompt(metadata.issueBody);

    // Call Bedrock
    const params = {
      modelId: "anthropic.claude-v2", // or another suitable model
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        prompt,
        max_tokens_to_sample: 500,
        temperature: 0.7,
        top_p: 1,
      }),
    };

    const command = new InvokeModelCommand(params);
    const response = await bedrock.send(command);

    // Parse the response
    const bedrockResponse = JSON.parse(new TextDecoder().decode(response.body)).completion;

    console.log ("bedrock response", bedrockResponse);

    // Post the response back to GitHub
    const { GITHUB_TOKEN } = process.env;
    const { url: issueUrl } = JSON.parse(event.body).issue;
    await axios.post(`${issueUrl}/comments`, {
      body: bedrockResponse
    }, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify('Response posted successfully')
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify('Error processing request')
    };
  }
};