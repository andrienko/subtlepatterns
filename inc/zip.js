const unzipper = require("unzipper");
const { existsSync, createWriteStream, createReadStream } = require("fs");
const path = require("path");

const { imageFilePattern } = require("./common");

const collectSingleFileMeta = (entry, arcDir) =>
  new Promise(resolve => {
    const fileName = path.resolve(arcDir, entry.fileName);
    if (existsSync(fileName)) {
      ///
      const entryData = {};

      const meta = {};
      const files = [];

      if (entry.title) {
        entryData.title = entry.title;
      }

      meta.originalZip = entry.fileName;

      if (entry.description) {
        meta.description = entry.description;
      }
      if (entry.date) {
        meta.date = entry.date;
      }
      if (entry.authorUrl) {
        meta.url = entry.authorUrl;
      }
      if (entry.authorName) {
        meta.author = entry.authorName;
      }

      entryData.meta = meta;
      entryData.files = files;

      createReadStream(fileName)
        .pipe(unzipper.Parse())
        .on("entry", function(fileData) {
          const fileName = fileData.path;
          const lfn = fileName.toLowerCase();
          const baseName = path.basename(fileName);
          if (
            !lfn.match(/.txt$/) &&
            fileData.type === "File" &&
            !fileName.includes("__MACOSX") &&
            !fileName.includes(".DS_Store") &&
            lfn.match(imageFilePattern)
          ) {
            entryData.files.push(baseName);
          }
          return fileData.autodrain();
        })
        .on("finish", () => resolve(entryData));
    } else {
      console.error("We have lost", fileName);
    }
  });

const collectMeta = (list, arcDir) =>
  new Promise(resolve => {
    const patterns = [];
    Promise.all(
      list.map((item, index) =>
        collectSingleFileMeta(item, arcDir).then(
          entryData => (patterns[index] = entryData)
        )
      )
    ).then(() => resolve(patterns));
  });

const extractFiles = (patterns, arcDir, imgDir) => {
  let filesExtracted = 0;
  return new Promise(resolve =>
    Promise.all(
      patterns.map(
        pattern =>
          new Promise(resolve => {
            const zipFile = path.resolve(arcDir, pattern.meta.originalZip);
            if (existsSync(zipFile)) {
              createReadStream(zipFile)
                .pipe(unzipper.Parse())
                .on("entry", function(fileData) {
                  const fileName = fileData.path;
                  const lfn = fileName.toLowerCase();
                  const baseName = path.basename(fileName);
                  if (
                    !lfn.match(/.txt$/) &&
                    fileData.type === "File" &&
                    !fileName.includes("__MACOSX") &&
                    !fileName.includes(".DS_Store") &&
                    pattern.files.includes(baseName)
                  ) {
                    const newFileName = path.resolve(imgDir, baseName);
                    if (existsSync(newFileName)) {
                      console.log(`${newFileName} already exists, skipping`);
                      return fileData.autodrain();
                    }
                    filesExtracted++;
                    return fileData.pipe(createWriteStream(newFileName));
                  }
                  return fileData.autodrain();
                })
                .on("finish", () => {
                  resolve();
                });
            } else {
              console.log(`${zipFile} does not exist, can not extract.`);
              resolve();
            }
          })
      )
    ).then(() => resolve(filesExtracted))
  );
};

module.exports = {
  extractFiles,
  collectMeta,
  collectSingleFileMeta
};
