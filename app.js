const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const prompt = require("prompt");
const schema = [
  { name: "folderPath", description: "Folder Complete Path", required: false },
  { name: "projectName", description: "Project Name", required: true },
  { name: "addGit", description: "Add git ?", required: true },
  { name: "typeOfJS", description: "NodeJS(node,n) or React(react,r)", required: true },
];
const defaultProjectPath = path.join("D:", "My_Codes");

prompt.start();
prompt.get(schema, (err, res) => {
  var folderPath = res.folderPath.replace(/"/g, "") || defaultProjectPath;
  var projectName = res.projectName.replace(/"/g, "");
  var addGit = res.addGit.replace(/"/g, "").toLowerCase();
  var typeOfJS = res.typeOfJS.replace(/"/g, "").toLowerCase();
  var completePath = path.join(folderPath, projectName);

  // create sample folder
  try {
    if (!fs.existsSync(completePath)) {
      fs.mkdirSync(completePath);
      console.info("FOLDER:", completePath, "created.");

      const isNode = typeOfJS === "n" || typeOfJS === "nodejs" ? true : false;
      const isReact = typeOfJS === "r" || typeOfJS === "react" ? true : false;
      const command = isReact ? `npx create-react-app ${projectName}` : "npm init --y";

      // npm init
      executeCommand(command, isNode ? completePath : folderPath)
        .then(async () => {
          console.info("LOG :", "NPM Initialised.");

          if (isNode) {
            // create app.js file
            createFile(completePath, "app.js");

            // add git ??
            if (addGit == "y" || addGit == "yes") {
              // add .gitignore file
              const gid = fs.readFileSync("./gitignore-template.txt");
              createFile(completePath, ".gitignore", gid);

              // git init
              try {
                await executeCommand(`git init`, completePath);
                console.info("LOG :", "Git Initialised.");
                await executeCommand(`git add .`, completePath);
                return await executeCommand(`git commit -m "Initial Commit." .`, completePath);
              } catch (err) {
                console.error("LOG :", "Failed at", err.message);
              }
            }
          } else return "";
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
            console.info("Bye Bye...");
            process.exit(-1);
          }, 3000);
        })
        .catch(console.log);
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

function executeCommand(cmd, path = defaultProjectPath) {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd: path }, (err, stdout, stderr) => {
      if (err) return reject(err, stderr);
      return resolve(stdout, stderr);
    });
  });
}
