const fs = require("fs");
const express = require("express");
const path = require("path");
const simpleGit = require("simple-git");
const { exec } = require("child_process");

const app = express();
const git = simpleGit();

// Configure Git user details
git.raw(["config", "--global", "user.name", "tahsun1462"]);
git.raw(["config", "--global", "user.email", "tafa4205@gmail.com"]);

// Ensure the remote origin is set
git.remote(["remove", "origin"]).catch(() => {}); // Remove if it exists
git.remote(["add", "origin", "https://github.com/TaHsUN1462/SmartKhata.git"])
  .catch(err => console.error("Git Remote Set Error:", err));

require("dotenv").config();

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
      return res.status(500).json({ error: "Error Updating File" });
    }

    console.log("Data Updated Successfully.");

    // Set user identity before commit
    git.addConfig("user.name", "tahsun1462");
    git.addConfig("user.email", "tafa4205@gmail.com");

    git.pull("origin", "main")
      .then(() => {
        console.log("Git Pulled Successfully");
        return git.add("./data.json");
      })
      .then(() => git.commit("Updated data.json from API"))
      .then(() => git.push("origin", "main"))
      .then(() => {
        res.json({ message: "Updated & pushed successfully" });
      })
      .catch(gitErr => {
        console.error("Git Error:", gitErr);
        res.status(500).json({ error: "Git Operation Failed" });
      });
  });
});

app.get("/deals/:id", (req, res) => {
  res.sendFile(path.join(__dirname, `./public/deal.html`));
});

app.listen(3000, () => {
  console.log("Server Started");
});