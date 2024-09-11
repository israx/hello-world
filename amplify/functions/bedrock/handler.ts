import { commentOnIssue, getGhIssueMetadata, processIssue } from "./helpers";

export const handler = async (event:any) => {
  try {
    // Extract issue metadata from the event
    const metadata = await getGhIssueMetadata(event);

    console.log("issue metadata", JSON.stringify(metadata, null, 2));
 
    if (
      metadata.labels?.includes('solved') || 
      metadata.labels?.includes('pending-maintainer-response') || 
      !metadata.isTicketOwner) 
      {
      console.log('Issue has solved or pending-maintainer-response label. Stopping execution.');
      return { statusCode: 200, body: JSON.stringify({ message: 'Skipped due to issue labels' }) };
    }

    // Call Bedrock
    const response = await  processIssue(metadata);
    console.log ("bedrock response", response);

    // Post the response back to GitHub
    await commentOnIssue(metadata, response);

    return {
      statusCode: 200,
      body: JSON.stringify('Response posted successfully')
    };
  } catch (error:any) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify(`Error processing request: ${error?.message}`)
    };
  }
};
