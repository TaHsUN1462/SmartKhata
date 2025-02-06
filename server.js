const fs = require("fs");
const express = require("express");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
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

let dataArray = [];
let activeUsers = new Set();
let lastActiveTime = new Date().getTime();
let isRedeployed = false; // Prevent multiple redeployments

app.use(express.json());
app.use(express.static("public"));

app.use((req, res, next) => {
  const currentTime = new Date().getTime();
  if (currentTime - lastActiveTime > 120000) { // 5 minutes (in milliseconds)
    if (!isRedeployed) {
      activeUsers.clear(); // Clear active users if 5 minutes have passed
      isRedeployed = true; // Set flag to prevent multiple redeployments
      console.log("No users for 5 minutes. Ready for redeployment.");
    }
  }
  lastActiveTime = currentTime;
  next();
});

app.get("/", (req, res) => {
  const ip = req.ip;
  activeUsers.add(ip); // Add user to active users list
  isRedeployed = false; // Reset redeploy flag when a new user joins
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/data", (req, res) => {
  fs.readFile("./data.json", "utf-8", (err, data) => {
    if (err) {
      res.status(500).send("Error: " + err);
    } else {
      dataArray = JSON.parse(data);
      res.json(dataArray);
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

          git.checkout("main")
            .then(() => git.addConfig('user.name', 'tahsun1462'))
            .then(() => git.addConfig('user.email', 'tafa4205@gmail.com'))
            .then(() => git.add("./data.json"))
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
  const id = Number(req.params.id);
  if (id > 0 && id <= dataArray.length) {
    res.sendFile(path.join(__dirname, "./public/deal.html"));
  } else {
    res.status(404).sendFile(path.join(__dirname, "public/error.html"));
  }
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "public/error.html"));
});

app.listen(3000, () => {
  console.log("Server Started");
});