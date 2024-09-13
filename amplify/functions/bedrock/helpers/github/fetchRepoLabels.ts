import { Octokit } from "@octokit/rest";


export async function fetchRepoLabels(owner: string, repo: string) {
    // Create a new Octokit instance
    const octokit = new Octokit({
        auth: 'YOUR_GITHUB_PERSONAL_ACCESS_TOKEN'
    });

    try {
        const response = await octokit.issues.listLabelsForRepo({
            owner,
            repo,
        });

        console.log('Labels:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching labels:', error);
    }
}

