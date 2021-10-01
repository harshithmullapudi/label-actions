const core = require("@actions/core");
const github = require("@actions/github");
const axios = require("axios");

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
    console.log(payload);
    const threadData = payload.issue || payload.pull_request;

    let labels = [];

    const thread = payload.issue ? "issues" : "pulls";

    const url = `${threadData.repository_url}/${thread}/${threadData.number}`;

    const response = await axios(url, {
      auth: {
        user: core.getInput("github-username"),
        password: core.getInput("github-token"),
      },
    });

    const { author_association } = response.data;
    console.log(response.data);
    if (author_association) {
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
}

run();
