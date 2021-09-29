const core = require("@actions/core");
const github = require("@actions/github");

async function run() {
  try {
    const client = github.getOctokit(core.getInput("github-token"));
    const app = new App(client);
    await app.performActions();
  } catch (err) {
    core.setFailed(err);
  }
}

class App {
  constructor(client) {
    this.client = client;
  }

  async performActions() {
    const payload = github.context.payload;
    console.log(`Hello ${JSON.stringify(payload)}!`);
    const threadType = payload.issue ? "issue" : "pr";

    const threadData = payload.issue || payload.pull_request;

    const { owner, repo } = github.context.repo;
    const issue = { owner, repo, issue_number: threadData.number };
    console.log(`Hello ${JSON.stringify(issue)}!`);
    const newLabels = ["new"];

    if (newLabels.length) {
      core.debug("Labeling");
      await this.client.rest.issues.addLabels({
        ...issue,
        labels: newLabels,
      });
    }
  }
}

run();
