export function extractResponseType(input: string): { type: string; response: string } {
  const typeRegex = /Type:\s*\*{3}(.*?)\*{3}/;
  const responseRegex = /Response:\s*\*{3}(.*?)\*{3}/s;

  const typeMatch = input.match(typeRegex);
  const responseMatch = input.match(responseRegex);

  if (!typeMatch || !responseMatch) {
    throw new Error("Invalid input format");
  }

  return {
    type: typeMatch[1].trim(),
    response: responseMatch[1].trim()
  };
}