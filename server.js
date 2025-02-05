const fs = require("fs");
const express = require("express");
const path = require("path");
const simpleGit = require("simple-git");
const { exec } = require("child_process");

const app = express();
const git = simpleGit();

git.raw(['config', '--global', 'user.name', 'tahsun1462']);
git.raw(['config', '--global', 'user.email', 'tafa4205@gmail.com']);

require('dotenv').config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_URL = `https://${GITHUB_TOKEN}@github.com/TaHsUN1462/SmartKhata.git`;

app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/data", (req, res) => {
  fs.readFile("./data.json", "utf-8", (err, data) => {
    if (err) {
      res.status(500).send("Error: " + err);
    } else {
      res.json(JSON.parse(data));
    }
  });
});

app.post("/data", async (req, res) => {
  let newData = req.body;

  fs.writeFile("./data.json", JSON.stringify(newData, null, 2), async (err) => {
    if (err) {
      res.status(500).json({ error: "Error Updating File" });
    } else {
      console.log("Data Updated Successfully.");

      exec('git remote -v', (error, stdout, stderr) => {
        if (stderr) {
          console.error("Git Remote Check Error:", stderr);
          return res.status(500).json({ error: "Error checking Git remote" });
        }

        if (!stdout.includes('origin')) {
          exec(`git remote add origin ${REPO_URL}`, (addError, addStdout, addStderr) => {
            if (addError || addStderr) {
              console.error("Error adding Git remote:", addStderr || addError);
              return res.status(500).json({ error: "Failed to add Git remote" });
            }
            console.log("Git Remote added successfully:", addStdout);
          });
        }

        exec("git pull origin main", (error, stdout, stderr) => {
          if (error) {
            console.error("Git Pull Error:", stderr);
            return res.status(500).json({ error: "Git Pull Failed" });
          }
          console.log("Git Pulled Successfully:", stdout);

          git.addConfig('user.name', 'tahsun1462')
            .addConfig('user.email', 'tafa4205@gmail.com')
            .add("./data.json")
            .then(() => {
              console.log("Staged changes successfully.");
              return git.commit("Updated data.json from API");
            })
            .then(commitSummary => {
              console.log("Commit Summary:", commitSummary);
              if (!commitSummary.commit) {
                console.error("No new changes detected, skipping push.");
                return res.status(400).json({ error: "No changes to commit." });
              }
              return git.push(REPO_URL, "main");
            })
            .then(() => {
              console.log("Git Push Success!");
              res.json({ message: "Updated & pushed successfully" });
            })
            .catch(gitErr => {
              console.error("Git Error:", gitErr);
              res.status(500).json({ error: "Git Operation Failed" });
            });
        });
      });
    }
  });
});

app.get("/deals/:id", (req, res) => {
  res.sendFile(path.join(__dirname, `./public/deal.html`));
});

app.listen(3000, () => {
  console.log("Server Started");
});