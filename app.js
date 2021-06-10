const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const prompt = require("prompt");
prompt.start();

prompt.get(["folderPath", "projectName", "addGit"], (err, res) => {
  var folderPath = res.folderPath.replace(/"/g, "");
  var projectName = res.projectName.replace(/"/g, "");
  var addGit = res.addGit.replace(/"/g, "").toLowerCase();
  var completePath = path.join(folderPath, projectName);

  // create sample folder
  try {
    if (!fs.existsSync(completePath)) {
      fs.mkdirSync(completePath);
      console.info("FOLDER:", completePath, "created.");

      // npm init
      executeCommand(`npm init --y`, completePath)
        .then(() => {
          console.info("LOG :", "NPM Initialised.");

          // create app.js file
          createFile(completePath, "app.js");

          // add git ??
          if (addGit == "y" || addGit == "yes") {
            // add .gitignore file
            const gid = fs.readFileSync("./gitignore-template.txt");
            createFile(completePath, ".gitignore", gid);

            // git init
            return executeCommand(`git init`, completePath)
              .then(() => {
                console.info("LOG :", "Git Initialised.");
                // git add all
                return executeCommand(`git add .`, completePath);
              })
              .then(() => {
                // git first commit
                return executeCommand(
                  `git commit -m "Initial Commit." .`,
                  completePath
                );
              })
              .catch((err) => {
                console.error("LOG :", "Failed at", err.message);
              });
          }
        })
        .then(() => {
          // open in vs code
          return executeCommand(`code .`, completePath);
        })
        .then(() => {
          console.info("LOG :", "Project template is ready.");
          console.info("LOG :", "Opening VS Code...");
          console.info("LOG :", "Process completed.");
          setTimeout(() => {
            process.exit(-1);
          }, 2000);
        })
        .catch((err) => {});
    } else {
      console.info("LOG :", completePath, "folder already exists.");
    }
  } catch (err) {
    console.error(err);
  }
});

function createFile(completePath, name, data = "// Auto generated file") {
  const fileStream = fs.createWriteStream(path.join(completePath, name));
  fileStream.write(data);
  console.info("FILE:", name, "created.");
  fileStream.end();
}

function executeCommand(cmd, path = __dirname) {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd: path }, (err, stdout, stderr) => {
      if (err) return reject(err);
      return resolve(stdout);
    });
  });
}
