export const workAround = `
### 1. Suggest a Workaround
If you have enough information to identify the issue and propose a solution:
- Provide a clear, step-by-step workaround.
- Include relevant code snippets if applicable.
- Suggest updating dependencies or cleaning node_modules if necessary.
- Explain why this workaround should resolve the issue.
`
export const clarifyingQuestions = `
### 2. Ask Clarifying Questions
If the information provided is incomplete or ambiguous:
- Identify the specific areas where more information is needed.
- Formulate clear, concise questions to gather the necessary details. Limit the answer to 4 questions maximum. The less questions the better.
- Explain why this additional information is crucial for diagnosing the issue.
`
export const unableToAnswer = `
### 3. Unable to Answer
If the information provided is insufficient or contradictory, and you cannot formulate meaningful clarifying questions:
- Clearly state that you are unable to provide a definitive answer.
- Explain why you cannot answer, highlighting the specific gaps or inconsistencies in the information provided.
- Suggest general troubleshooting steps or resources that might help the user diagnose the issue independently.
`

export const inappropriate = `
### 4. Inappropriate answer
If the information provided is inappropriate for user:
- Clearly state that the information is inappropriate.
- Explain why the information is inappropriate for the user.
`

export const solved =`
### 5. solved
If the problem is solved:
- Recognize the issue is solved
`
