const fs = require("fs");
const express = require("express");
const path = require("path");
const simpleGit = require("simple-git");
const { exec } = require("child_process");
require("dotenv").config();

const app = express();
const git = simpleGit();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_URL = `https://${GITHUB_TOKEN}@github.com/TaHsUN1462/SmartKhata.git`;

app.use(express.json());
app.use(express.static("public"));

// Set Git User Identity (Fix for Render)
git.addConfig("user.name", "tahsun1462");
git.addConfig("user.email", "tafa4205@gmail.com");

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/data", (req, res) => {
  fs.readFile("./data.json", "utf-8", (err, data) => {
    if (err) res.status(500).send("Error: " + err);
    else res.json(JSON.parse(data));
  });
});

app.post("/data", async (req, res) => {
  let newData = req.body;

  fs.writeFile("./data.json", JSON.stringify(newData, null, 2), async (err) => {
    if (err) return res.status(500).json({ error: "Error Updating File" });

    console.log("Data Updated Successfully.");

    // Pull latest changes from GitHub
    exec("git pull origin main", async (error, stdout, stderr) => {
      if (error) {
        console.error("Git Pull Error:", stderr);
        return res.status(500).json({ error: "Git Pull Failed" });
      }
      console.log("Git Pulled Successfully:", stdout);

      // Ensure the remote is correctly set
      await git.removeRemote("origin").catch(() => {});
      await git.addRemote("origin", REPO_URL);

      // Push updates to GitHub
      git.add("./data.json")
        .then(() => git.commit("Updated data.json from API"))
        .then(() => git.push("origin", "main"))
        .then(() => res.json({ message: "Updated & pushed successfully" }))
        .catch(gitErr => {
          console.error("Git Push Error:", gitErr);
          res.status(500).json({ error: "Git Push Failed" });
        });
    });
  });
});

app.get("/deals/:id", (req, res) => {
  res.sendFile(path.join(__dirname, `./public/deal.html`));
});

app.listen(3000, () => {
  console.log("Server Started");
});