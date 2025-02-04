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

      exec(`git remote set-url origin https://${GITHUB_TOKEN}@github.com/TaHsUN1462/SmartKhata.git`, (error, stdout, stderr) => {
        if (error) {
          console.error("Git Remote Set Error:", stderr);
          return res.status(500).json({ error: "Git Remote Set Failed" });
        }
        console.log("Git Remote Set Successfully:", stdout);

        exec("git pull origin main", (error, stdout, stderr) => {
          if (error) {
            console.error("Git Pull Error:", stderr);
            return res.status(500).json({ error: "Git Pull Failed" });
          }
          console.log("Git Pulled Successfully:", stdout);

          git.add("./data.json")
            .then(() => git.commit("Updated data.json from API"))
            .then(() => git.push(REPO_URL, "main"))
            .then(() => {
              console.log("Git Push Success!");
              res.json({ message: "Updated & pushed successfully" });
            })
            .catch(gitErr => {
              console.error("Git Push Error:", gitErr);
              res.status(500).json({ error: "Git Push Failed" });
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