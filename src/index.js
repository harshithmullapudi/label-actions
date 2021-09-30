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
    const threadData = payload.issue || payload.pull_request;


    
    const { author_association } = threadData;
    let labels = [];

    if (author_association == "CONTRIBUTOR" || author_association == "NONE") {
      labels = ["community"];
    }

    const { owner, repo } = github.context.repo;
    const issue = { owner, repo, issue_number: threadData.number };

    if (labels.length) {
      core.debug("Labeling");
      await this.client.rest.issues.addLabels({
        ...issue,
        labels,
      });
    }
  }
}

run();
