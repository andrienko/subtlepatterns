/*global require, module, console*/
module.exports = (function () {

  var request = require('request');
  var del = require('del');
  var fs = require('fs');
  var Download = require('download');

  var getPage = function (url, callback) {
    request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        callback(body, response);
      } else callback('', response);
    });
  };

  var getJSON = function (url, callback) {
    getPage(url, function (body) {
      try {
        callback(JSON.parse(body));
      } catch (e) {
        callback([]);
      }

    });
  };

  var lib = {

    /**
     * Gets contents of page from subtlepatterns.com JSON feed. The callback receives an array.
     * @param {function} callback The function will be called after the JSON is downloaded (and receive parsed JSON in)
     * @param {integer} page_number=1 The number of the page from JSON feed
     */
    getPatternsFromPage: function (callback, page_number) {
      page_number = page_number || 1;
      getJSON('http://subtlepatterns.com/?feed=json&paged=' + page_number, function (patterns) {
        callback(patterns);
      });
    },

    /**
     * Gets all whole JSON feed from subtlepatterns.com (may take time. May jam as it's recursion). The callback receives an array.
     * @param {function} callback The callback will be called after it's done. Will receive an JSON array.
     * @param {function} progress_handler If defined the handler will be called before each page download receiving number of page (starting from 1) and an array of patterns from that page
     */
    getAllPatterns: function (callback, progress_handler) {
      var all_patterns_list = [];

      var getNext = function (page) {
        page = page || 1;
        lib.getPatternsFromPage(function (patterns) {
          if (patterns.length > 1) {
            all_patterns_list = all_patterns_list.concat(patterns);
            if (typeof progress_handler === 'function') {
              progress_handler(page, patterns);
            }
            getNext(page + 1);
          } else {
            callback(all_patterns_list);
          }
        }, page);
      };
      getNext(1);
    },

    /**
     * Remove everything but name and excerpt, extract link, tags as array of strings
     * @param   {array} patterns_array An array received from JSON feed
     * @returns {array} a pretty array containing name, description, image url and tags array
     */
    filterPatternsJSON: function (patterns_array) {
      var filtered_array = [];
      patterns_array.forEach(function (pattern) {
        var name = pattern.title;
        var description = pattern.excerpt;
        var link = pattern.content.match(/url\([\s'"]*(.*?)[\s'"]*\)/)[1];
        var tags = [];
        pattern.tags.forEach(function (tag) {
          tags.push(tag.title);
        });

        var filtered_pattern = {
          name: name,
          link: link,
          description: description,
          tags: tags
        };

        filtered_array.push(filtered_pattern);
      });
      return filtered_array;
    },

    /**
     * Download JSON with all patterns, filter it and save to file
     * @param {string}   filename         File to save JSON to
     * @param {function} callback         The function will be called after saving file receiving the filename
     * @param {function} progress_handler The function will be called for each page downloaded
     */
    downloadPatternsJSON: function (filename, callback, progress_handler) {
      lib.getAllPatterns(function (patterns) {
        patterns = lib.filterPatternsJSON(patterns);
        fs.writeFileSync(filename, JSON.stringify(patterns, null, 2), 'utf-8');
        callback(filename, patterns);
      }, progress_handler);
    },

    /**
     * Delete files defined by a wildcard
     * @param {string} glob A wildcard to delete files
     */
    deleteFiles: function (glob) {
      del(glob);
    },

    /**
     * Download multiple files, one by one, URLs specified in array
     * @param {Array}  files       An array containing all the files
     * @param {string} destination Path to directory to save patterns to
     */
    downloadFilesFromArray: function (files, destination, callback) {
      var downloader = new Download();
      files.forEach(function (url) {
        downloader.get(url);
      });
      downloader.dest(destination);
      downloader.run(callback);
    }
  };
  return lib;
})();
