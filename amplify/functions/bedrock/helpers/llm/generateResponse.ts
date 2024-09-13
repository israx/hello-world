import { BedrockRuntimeClient, InvokeModelCommand, InvokeModelCommandInput } from "@aws-sdk/client-bedrock-runtime";
import { Response, Type } from "../../types";

export async function generateResponse(system: string, dataSet: string[]): Promise<string> {
    const bedrock = new BedrockRuntimeClient({ region: "us-east-1" });
    const params: InvokeModelCommandInput = {
        modelId: "anthropic.claude-3-5-sonnet-20240620-v1:0",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
            anthropic_version: "bedrock-2023-05-31",
            system,
            messages: [
                {
                    role: "user",
                    content: dataSet.map(text => ({
                        type: "text",
                        text,
                    })),
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
    console.log("bedrock response body", JSON.stringify(responseBody, null, 2));
    return  responseBody.content[0].text;
}
