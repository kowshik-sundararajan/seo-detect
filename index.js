const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const htmlparser = require('htmlparser2');
const argv = require('minimist')(process.argv.slice(2));

const INPUT_FILE_PATH = argv.in || './index.html';
const RULE_FILE_PATH = argv.rule || './rule.txt';
const OUTPUT_FILE_PATH = argv.out || './output.txt';
const input = {
  inputFilePath: INPUT_FILE_PATH,
  ruleFilePath: RULE_FILE_PATH,
  outputFilePath: OUTPUT_FILE_PATH,
};
const defaultPaths = {
  inputFilePath: INPUT_FILE_PATH,
  ruleFilePath: RULE_FILE_PATH,
  outputFilePath: './default.txt',
};
const tags = [];

let outputContents = '';


const parser = new htmlparser.Parser({
  onopentag: (name, attribs) => {
    tags.push({
      name,
      attribs,
    });
  },

  onend: () => {
    console.log('Input file has been processed, please check output file.');
  },
});


const handleExistsRule = (rule) => {
  const isPresent = tags.filter(tag => tag.name === rule.tag).length > 0;
  if (!isPresent) outputContents += `The HTML does not have a ${rule.tag} tag\n`;
};


const handleMoreRule = (rule) => {
  const tagCount = tags.filter(tag => tag.name === rule.tag).length;
  if (tagCount > rule.limit) outputContents += `There are more than ${rule.limit} ${rule.tag} tags in the HTML\n`;
};


const handleWithoutRule = (rule) => {
  if (rule.tag === 'meta') {
    const isPresent = tags.filter(tag => _.has(tag.attribs, rule.attribute)
      && tag.attribs.name === rule.value).length > 0;
    if (!isPresent) outputContents += `The HTML does not have <${rule.tag} ${rule.attribute}="${rule.value}"> tag\n`;
  } else {
    const invalidTagCount = tags.filter(tag => tag.name === rule.tag
      && !_.has(tag.attribs, rule.attribute)).length;
    if (invalidTagCount > 0) outputContents += `The HTML has ${invalidTagCount} ${rule.tag} tags without ${rule.attribute} attribute\n`;
  }
};


const writeToFile = (outputFilePath) => {
  fs.writeFile(outputFilePath, outputContents, (err) => {
    if (err) console.error(err);
    else console.log('File saved!');
  });
};


const detectSEO = (args) => {
  let { inputFilePath, ruleFilePath, outputFilePath } = defaultPaths;
  if (args.inputFilePath) {
    inputFilePath = args.inputFilePath;
    ruleFilePath = args.ruleFilePath;
    outputFilePath = args.outputFilePath;
  }

  fs.readFile(inputFilePath, (error, data) => {
    if (error) console.error(error);
    else {
      parser.write(data);
      parser.end();
      const rl = readline.createInterface({
        input: fs.createReadStream(ruleFilePath),
        crlfDelay: Infinity,
      });

      rl.on('line', (line) => {
        if (line === '===END===') {
          writeToFile(outputFilePath);
        } else {
          const rule = line.split(/\s+/);
          let ruleObject = {};
          switch (rule[1]) {
            case 'exists':
              ruleObject = {
                tag: rule[0],
              };
              handleExistsRule(ruleObject);
              break;

            case 'more':
              ruleObject = {
                tag: rule[0],
                limit: rule[2],
              };
              handleMoreRule(ruleObject);
              break;

            case 'without':
              if (rule[2].indexOf('=') !== -1) {
                const attrLen = rule[2].length;
                const attrLimiter = rule[2].indexOf('=');
                ruleObject = {
                  tag: rule[0],
                  attribute: rule[2].substring(0, attrLimiter),
                  value: rule[2].substring(attrLimiter + 2, attrLen - 1),
                };
              } else {
                ruleObject = {
                  tag: rule[0],
                  attribute: rule[2],
                };
              }
              handleWithoutRule(ruleObject);
              break;

            default:
              console.error('Invalid rule!');
          }
        }
      });
    }
  });
};

// TODO:
// Refactor into module code
// handleExistsRule should handle all cases

detectSEO(input);
// export default detectSEO;
