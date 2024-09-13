import { Octokit } from "@octokit/rest";
import { IssueMetadata } from "../../../types";

export async function addComment({ number, repositoryName }: IssueMetadata, response: string) {
    const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN
    });

    const [owner, repo] = repositoryName.split('/');
    await octokit.issues.createComment({
        owner,
        repo,
        issue_number: number,
        body: response
    });
}
