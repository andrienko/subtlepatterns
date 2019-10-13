#!/usr/bin/env node

const { resolve } = require("path");
const { mkdirSync, writeFileSync } = require("fs");

const argv = require("minimist")(process.argv.slice(2), {
  alias: {
    c: "colors"
  }
});

const {
  buildPageList,
  downloadAllFiles,
  collectMeta,
  extractFiles,
  getFolderPalette
} = require("./lib");

const dir = resolve(process.cwd(), "patterns");
const arcDir = resolve(dir, "archives");
const imgDir = resolve(dir, "images");

const jsonFile = resolve(dir, "meta.json");
const jsonPFile = resolve(dir, "meta.jsonp.js");

try {
  mkdirSync(dir);
  mkdirSync(arcDir);
  mkdirSync(imgDir);
} catch (e) {}

const writeFiles = data => {
  writeFileSync(jsonFile, JSON.stringify(data, null, 2));
  writeFileSync(jsonPFile, `initPatterns(${JSON.stringify(data)});`);
};

if (argv._.includes("list")) {
  buildPageList().then(list => {
    process.stdout.write(JSON.stringify(list, null, 2));
  });
} else {
  buildPageList().then(list => {
    console.log(
      "Loaded information about " +
        list.length +
        " patterns. Downloading zip files..."
    );
    downloadAllFiles(list, arcDir).then(num => {
      console.log(`Downloaded ${num} files in ${arcDir}`);
      collectMeta(list, arcDir).then(patterns => {
        extractFiles(patterns, arcDir, imgDir).then(number => {
          console.log(`Extracted ${number} files`);

          if (argv.colors) {
            console.log("Getting palette details");
            getFolderPalette(imgDir, 4).then(palette => {
              console.log("Palette received. Writing meta files");
              writeFiles({ patterns, palette });
            });
          } else {
            writeFiles({ patterns });
          }
        });
      });
    });
  });
}
