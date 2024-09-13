import { addComment } from "./helpers/github/issues/addComment";
import { generateResponse } from "./helpers/llm/generateResponse";
import { getMetadata } from "./helpers/github/issues/getMetadata";
import { amplifyAssistant } from "./prompts/base";
import { isResponse } from "./helpers/llm/parseResponse";
import { triage } from "./helpers/github/issues/triage";
import { extractResponseType } from "./helpers/extractResponseType";

export const handler = async (event: any) => {
  try {

    // Extract issue metadata from the event
    const metadata = await getMetadata(event);

    console.log("issue metadata", JSON.stringify(metadata, null, 2));

    if (
      metadata.action === 'closed' ||
      metadata.labels?.includes('pending-maintainer-response') 
      //!metadata.isTicketOwner // Only the ticket owner is able to trigger the lambda
    ) {
      console.log('Issue has closed or pending-maintainer-response label. Stopping execution.');
      return { statusCode: 200, body: JSON.stringify({ message: 'Skipped due to issue labels' }) };
    }

    let dataSet = Object.entries(metadata.template).map(([key, value]) => (`${key}: ${value}`));
    if (metadata.action === 'created') {
      console.log("issue commented");
      dataSet = [
    `
    Issue description: 
    
    ${metadata.template}

    `,
    ` 
    Amplify JS AI assistant comments: 
    
    ${metadata.aiAssistantComments?.join('\n')}

    `,
    `
    Customer JS comments: 
    
    ${metadata.ticketOwnerComments?.join('\n')}

    `
      ];
    }

    const response = await generateResponse(amplifyAssistant, dataSet);
    console.log("bedrock response", response);

    const typeObjec = extractResponseType(response);

    console.log("type object: ", JSON.stringify(typeObjec, null, 2));

    if (isResponse(typeObjec)) {
      await triage({
        type: typeObjec.type,
        response: typeObjec.response,
      }, metadata)
    } else {
      await addComment(metadata, response);
    };


    return {
      statusCode: 200,
      body: JSON.stringify('Response posted successfully')
    };
  } catch (error: any) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify(`Error processing request: ${error?.message}`)
    };
  }
};
