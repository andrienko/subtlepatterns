const fs = require("fs");
const path = require("path");

const request = require("request");

const { urlArchives } = require("./common");

const download = (uri, filename) =>
  new Promise(resolve => {
    request.head(uri, function() {
      request(uri)
        .pipe(fs.createWriteStream(filename))
        .on("close", resolve);
    });
  });

const downloadAllFiles = (list, arcDir) => {
  let num = 0;
  try {
    fs.mkdirSync(arcDir);
  } catch (e) {}

  return new Promise(resolve =>
    Promise.all(
      list.map(
        item =>
          new Promise(resolve => {
            const newFileName = path.resolve(arcDir, item.fileName);
            if (!fs.existsSync(newFileName)) {
              download(urlArchives + item.fileName, newFileName).then(() => {
                num++;
                resolve();
              });
            } else {
              console.log(`${newFileName} already exists`);
              resolve();
            }
          })
      )
    ).then(() => resolve(num))
  );
};

module.exports = {
  download,
  downloadAllFiles
};
