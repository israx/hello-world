import { Octokit } from "@octokit/rest";
import { IssueMetadata } from "../../../types";

export async function update({ number, repositoryName }: IssueMetadata, { body }: { body: string }) {

    const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN
    });

    const [owner, repo] = repositoryName.split('/');
    await octokit.rest.issues.update({
        owner,
        repo,
        issue_number: number,
        body,
    });
}
