const fs = require("fs");
const path = require("path");
const prompt = require("prompt");
const { executeCommand, createFile } = require("./utils.js");
const { defaultProjectPath } = require("./constants.js");

const schema = [
  { name: "folderPath", description: "Folder Complete Path", required: false },
  { name: "projectName", description: "Project Name", required: true },
  { name: "addGit", description: "Add git ?", required: true },
  { name: "typeOfJS", description: "NodeJS(node,n) or React(react,r)", required: true },
];

prompt.start();
prompt.get(schema, (err, res) => {
  let folderPath = res.folderPath.replace(/"/g, "") || defaultProjectPath;
  let projectName = res.projectName.replace(/"/g, "");
  let addGit = res.addGit.replace(/"/g, "").toLowerCase();
  let typeOfJS = res.typeOfJS.replace(/"/g, "").toLowerCase();
  let completePath = path.join(folderPath, projectName);

  // create sample folder
  try {
    if (!fs.existsSync(completePath)) {
      fs.mkdirSync(completePath, { recursive: true });
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
              const gid = fs.readFileSync(path.join("src", "templates", "gitignore.txt"));
              createFile(completePath, ".gitignore", gid);

              // git init
              try {
                await executeCommand(`git init`, completePath);
                console.info("LOG :", "Git Initialised.");
                await executeCommand(`git add .`, completePath);
                return await executeCommand(`git commit -m ":tada: Initial Commit."`, completePath);
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
      // todo: override? prompt
    }
  } catch (err) {
    console.error(err);
  }
});
