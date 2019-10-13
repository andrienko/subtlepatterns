const request = require("request");
const cheerio = require("cheerio");
const { urlMain, urlCutBeginRegex } = require("./common");

const getTotalPages = () =>
  new Promise((resolve, reject) =>
    request(urlMain, (err, res, body) => {
      if (body) {
        const $ = cheerio.load(body);
        const lastHref = $(".last").attr("href");
        const match = lastHref.match(/page\/(\d+)/);
        if (!match) {
          return reject("Could not find last page URL");
        }

        const totalPages = match[1];
        return resolve({
          totalPages,
          url: lastHref.replace(totalPages, "%num%")
        });
      }
      return reject("Error fetching page");
    })
  );

const loadPageContent = (url, pageNumber) =>
  new Promise(resolve =>
    request(url.replace("%num%", pageNumber), (err, res, body) => {
      if (body) {
        const $ = cheerio.load(body);
        const entries = $(".type-post .entry-content");
        const entriesData = [];
        entries.each(function() {
          const entryData = {};
          const $entry = $(this);
          entryData.title = $entry
            .find(".entry-title")
            .text()
            .trim();

          const authorData = $entry.find(".vcard.author .fn");

          if (authorData[0]) {
            entryData.authorName = authorData.text().trim();
            const authorHref = authorData.attr("href");
            if (authorHref) {
              entryData.authorUrl = authorHref;
            }
          }

          entryData.description = $entry
            .children("p")
            .slice(0, 1)
            .text()
            .trim();

          entryData.date = $entry
            .find("time")
            .text()
            .trim();

          entryData.fileName = $entry
            .find(".download")
            .attr("href")
            .replace(urlCutBeginRegex, "");

          const thumb = $entry.find(".patternpreview");
          if (thumb[0]) {
            const style = thumb.attr("style");
            const match = style.match(/url\(\'?(.*)\'?\)/);
            if (match) {
              entryData.thumb = match[1].replace(urlCutBeginRegex, "");
            }
          }

          entriesData.push(entryData);
        });
        return resolve(entriesData);
      }
    })
  );

const loadAllPages = () =>
  new Promise(resolve =>
    getTotalPages(urlMain).then(result => {
      const allPagesData = [];
      let loadedPages = 0;

      for (let i = 1; i <= result.totalPages; i++) {
        loadPageContent(result.url, i).then(data => {
          allPagesData.push({
            pageNumber: i,
            data
          });
          loadedPages++;
          if (loadedPages >= result.totalPages) {
            resolve(allPagesData);
          }
        });
      }
    })
  );

const buildPageList = () =>
  new Promise(resolve =>
    loadAllPages(urlMain).then(pages => {
      const pagesAsArray = pages
        .sort((a, b) => a.pageNumber - b.pageNumber)
        .reduce((arr, item) => arr.concat(item.data), [])
        .filter(item => !item.fileName.match(/^http/)); // Removing ads (when  url does not follow to patterns)
      resolve(pagesAsArray);
    })
  );

module.exports = {
  getTotalPages,
  loadAllPages,
  loadPageContent,
  buildPageList
};
