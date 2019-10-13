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
              // Apparently, in color-thief, colors are 1-based o_o (1-256)
              let hex = (c === 0 ? 1 : c - 1).toString(16);
              return hex.length === 1 ? `0${hex}` : hex;
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
