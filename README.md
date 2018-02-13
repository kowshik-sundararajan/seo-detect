# SEO Detect
A Node.js package that scans a HTML file and show all of the SEO defects specified by the user.

## Requirements
* Node
* npm

## Installation
    npm install seo-detect

## Dependencies
* [htmlparser2](https://github.com/fb55/htmlparser2/)
* [lodash](https://lodash.com/)

## Usage
```javascript
const seoDetect = require('seoDetect');
// specify input, rule and output file paths
seoDetect.getResults({
  inputFilePath: 'path/to/input/file',
  ruleFilePath: 'path/to/rule/file',
  outputFilePath: 'path/to/output/file',
});
```
## Setting rules
Three formats are allowed:
  * `<tag_name>` exists or `<tag_name attribute>` exists
  * `<tag_name>` without `attribute`
  * `<tag_name>` limit `number`

There are five default rules specified:
```html
1. <img> without alt
2. <a> without rel
3. In <head>:
    <title> exists
    <meta name="description"> exists
    <meta name="keywords"> exists
4. <strong> limit 15
5. <h1> limit 1
```  
If you want to add/remove rules, you can either edit the `seo-detect/test_files/rule.txt` file or specify your own rule file path.

## Testing
After cloning the repo and installing the modules, run `npm run test` with or without arguments.

Use a module like [minimist](https://www.npmjs.com/package/minimist) to accept input from the user. An example can be found at [test.js](https://github.com/kowshik-sundararajan/seo-detect/blob/master/lib/test.js)

## Authors
[Kowshik Sundararajan](https://github.com/kowshik-sundararajan)

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
