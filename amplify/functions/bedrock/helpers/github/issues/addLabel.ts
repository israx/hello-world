import { Octokit } from "@octokit/rest";
import { IssueMetadata } from "../../../types";

export async function addLabel({ number, repositoryName }: IssueMetadata, label: string) {
    const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN
    });

    const [owner, repo] = repositoryName.split('/');

    await octokit.issues.addLabels({
        owner,
        repo,
        issue_number: number,
        labels: [label]
    });
}