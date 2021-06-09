const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const prompt = require("prompt");
prompt.start();

prompt.get(["folderPath", "projectName", "addGit"], (err, res) => {
  var folderPath = res.folderPath.replace(/"/g, "");
  var projectName = res.projectName.replace(/"/g, "");
  var addGit = res.addGit.replace(/"/g, "");
  var completePath = path.join(folderPath, projectName);

  // create sample folder
  try {
    if (!fs.existsSync(completePath)) {
      fs.mkdirSync(completePath);
      console.info(completePath, "created.");

      // npm init
      executeCommand(`npm init --y`, completePath);

      // create app.js file
      createFile(completePath, "app.js");

      // add git ??
      if (addGit == "y") {
        // add .gitignore file
        createFile(completePath, ".gitignore", "node_modules");

        // git init
        executeCommand(`git init`, completePath);
        console.info("NPM Initialised.");
      }

      // open in vs code
      executeCommand(`code .`, completePath);
    } else {
      console.info(completePath, "folder already exists.");
    }
  } catch (err) {
    console.error(err);
  }
});

function createFile(completePath, name, data = "// Auto generated file") {
  const fileStream = fs.createWriteStream(path.join(completePath, name));
  fileStream.write(data);
  console.info(name, "file created.");
  fileStream.end();
}

function executeCommand(cmd, path) {
  exec(cmd, { cwd: path }, (err, stdout, stderr) => {
    if (err) throw console.error(err);
    console.log(stdout);
  });
}
