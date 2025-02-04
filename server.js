const fs = require("fs");
const express = require("express");
const path = require("path");
const simpleGit = require("simple-git");
const { exec } = require("child_process");

const app = express();
const git = simpleGit();

require('dotenv').config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const REPO_URL = `https://${GITHUB_TOKEN}@github.com/TaHsUN1462/SmartKhata.git`;  // Use your repo URL

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

      // Pull the latest changes using simpleGit (preferred over exec)
      try {
        await git.pull(REPO_URL, "main"); // Use simpleGit for pulling
        console.log("Git Pulled Successfully");

        // Stage and commit the updated data.json
        await git.add("./data.json");
        await git.commit("Updated data.json from API");

        // Push the updated file back to GitHub
        await git.push(REPO_URL, "main");
        console.log("Git Pushed Successfully");

        res.json({ message: "Updated & pushed successfully" });
      } catch (gitErr) {
        console.error("Git Error:", gitErr);
        res.status(500).json({ error: "Git Pull or Push Failed" });
      }
    }
  });
});

app.get("/deals/:id", (req, res) => {
  res.sendFile(path.join(__dirname, `./public/deal.html`));
});

app.listen(3000, () => {
  console.log("Server Started");
});