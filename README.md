[![npm install subtlepatterns](https://nodei.co/npm/subtlepatterns.png?mini=true)](https://www.npmjs.com/package/subtlepatterns)

# Subtle patterns download tool

Just a simple tool that can:

- get actual patterns meta in JSON format from [subtlepatterns](http://subtlepatterns.com) website
- download the patterns, unpack them and generate meta file with files and palette information.

The patterns are under **CC BY-SA 3.0** license. So play nicely and leave a credit when you use them.
The generated meta files contain the meta from the website (author and link (if any), as well as description)

Read [FAQ](http://subtlepatterns.com/about/) at subtlepatterns.com for more.

## Usage

To use as a lib (why would you need that? Whatever...) you can simply `require` the package (there is a `bin.js` file,
see it for usage example). The methods the lib exposes are promise-based, but the API may be imperfect...

To download the patterns (files) and build JSON with meta - install package globally via npm 
(`npm install -g subtlepatterns`) and run `subtlepatterns` in command line under  any directory you have write access -
 and the files should be downloaded to `patterns` directory under current working directory.

Another option is running `subtlepatterns list` - it will simply skim through all the patterns pages, grab the meta
and output it as array into stdout.

Of course, you can pipe the output via something like `subtlepatterns list > patterns.json`.

## Dependencies

- [cheerio](https://www.npmjs.com/package/cheerio)
- [request](https://www.npmjs.com/package/request)
- [color-thief](https://www.npmjs.com/package/color-thief)
- [unzipper](https://www.npmjs.com/package/unzipper)
