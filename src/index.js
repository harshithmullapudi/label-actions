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
    const threadData = payload.issue || payload.pull_request;

    let labels = [];

    const { url } = threadData;
    console.log(url);
    const response = await axios(url, {
      auth: {
        user: core.getInput("github-username"),
        password: core.getInput("github-token"),
      },
    });

    console.log(response.data);

    const { author_association } = response.data;
    if (author_association) {
      if (
        author_association == "CONTRIBUTOR" ||
        author_association == "NONE" ||
        author_association == "FIRST_TIME_CONTRIBUTOR" ||
        author_association == "FIRST_TIMER"
      ) {
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
