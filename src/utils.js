const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { defaultProjectPath } = require("./constants.js");

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

module.exports = { createFile, executeCommand };