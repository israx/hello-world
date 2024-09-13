export function merge(prompts: string[]): string {
  return prompts.reduce(([acc, curr], index) => {

    return `
        
    ${acc}
    ___________________________________

    Prompt ${index}:
    Description: 
      ${curr}
    ___________________________________
    
    `;
  }, '')
}
