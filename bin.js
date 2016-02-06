#!/usr/bin/env node

var patterns = require('.');
var fs = require('fs');

var args = process.argv.slice(2);

var mode = 'help';

var getJson = function (filename) {
  if (!fs.existsSync(filename)) return {};
  var data = fs.readFileSync(filename, 'utf-8');
  try {
    return JSON.parse(data);
  } catch (E) {
    return {};
  }
};

var mkdirSync = function (path) {
  try {
    fs.mkdirSync(path);
  } catch(e) {
    if ( e.code != 'EEXIST' ) throw e;
  }
};

var build_compact_json = function (patterns_json) {
  patterns_json = patterns.filterPatternsJSON(patterns_json);

  var compact_patterns = {
    n: [],
    l: [],
    d: []
  };
  patterns_json.forEach(function (pattern) {
    compact_patterns.n.push(pattern.name);
    compact_patterns.l.push(pattern.link);
    compact_patterns.d.push(pattern.description);
  });
  return compact_patterns;
};


if (args.length > 0) {
  mode = args[0];
}

if (mode == 'help') {
  console.log('subtlepatterns download [folder] -- download all the images to the folder');
} else if (mode == 'download') {
  var folder = args[1] || 'patterns/';
  var compact_patterns = getJson(folder + '/patterns_compact.json');

  var download = function () {
    console.log('Downloading ' + compact_patterns.l.length + ' files to ' + folder + ' folder (may take couple minutes)');
    patterns.downloadFilesFromArray(compact_patterns.l.map(function (a) {
      return 'http://subtlepatterns.com' + a;
    }), folder, function (a, b, c) {
      console.log('Should be done now');
    });
  };

  if (compact_patterns.l) {
    download();
  } else {
    patterns.getAllPatterns(function (data) {
      compact_patterns = build_compact_json(data);
      mkdirSync(folder);
      fs.writeFileSync(folder + '/patterns_compact.json', JSON.stringify(compact_patterns));
      download();
    }, function (page) {
      console.log('Getting page ' + page + ' (of about 41)');
    });
  }
}
