const { download, downloadAllFiles } = require("./inc/download");
const {
  loadAllPages,
  buildPageList,
  getTotalPages,
  loadPageContent
} = require("./inc/website");
const {
  collectMeta,
  collectSingleFileMeta,
  extractFiles
} = require("./inc/zip");

const { getFolderPalette, getPalette } = require("./inc/colors");

module.exports = {
  downloadAllFiles,
  download,
  loadAllPages,
  buildPageList,
  getTotalPages,
  loadPageContent,
  collectMeta,
  collectSingleFileMeta,
  extractFiles,
  getFolderPalette,
  getPalette
};
