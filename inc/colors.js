const { resolve: pathResolve } = require("path");
const { readdirSync } = require("fs");

const { imageFilePattern } = require("./common");

const colorThief = new (require("color-thief"))();

const getPalette = (fileName, number = 3) =>
  new Promise(resolve =>
    resolve(
      colorThief.getPalette(fileName, number - 1, 2).map(
        rgb =>
          "#" +
          rgb
            .map(c => {
              let hex = c.toString(16);
              if (hex.length === 1) {
                hex = `0${hex}`;
              }
              return hex;
            })
            .join("")
      )
    )
  );

const getFolderPalette = (dir, number = 3) =>
  new Promise(resolve => {
    const files = readdirSync(dir).filter(file => file.match(imageFilePattern));
    const data = {};
    Promise.all(
      files.map(
        fileName =>
          new Promise(resolve => {
            try {
              getPalette(pathResolve(dir, fileName), number).then(palette => {
                data[fileName] = palette;
                resolve();
              });
            } catch (e) {
              console.log(`Unable to get palette for ${fileName} `, e);
              resolve();
            }
          })
      )
    ).then(() => resolve(data));
  });

module.exports = {
  getPalette,
  getFolderPalette
};
