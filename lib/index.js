const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const htmlparser = require('htmlparser2');

const INPUT_FILE_PATH = path.join(__dirname, '..', 'test_files', 'index.html');
const RULE_FILE_PATH = path.join(__dirname, '..', 'test_files', 'rule.txt');
const OUTPUT_FILE_PATH = path.join(__dirname, '..', 'test_files', 'default.txt');
const defaultPaths = {
  inputFilePath: INPUT_FILE_PATH,
  ruleFilePath: RULE_FILE_PATH,
  outputFilePath: OUTPUT_FILE_PATH,
};

let currentRule = {};

// Helper functions
const isObjectSubset = (tag, rule) => {
  let boolVal = false;
  _.forEach(rule.attribute, (value, key) => {
    boolVal = _.has(tag.attribs, key) && _.includes(tag.attribs, value);
  });
  return boolVal;
};


const getTagAttrString = (rule) => {
  let printStr = '';
  _.forEach(rule.attribute, (value, key) => {
    printStr += `${key}="${value}" `;
  });
  return printStr.trim();
};


const seoDetect = (() => {
  const tags = [];
  let outputContents = '';

  const inputHtmlparser = new htmlparser.Parser({
    onopentag: (name, attribs) => {
      tags.push({
        name,
        attribs,
      });
    },

    onend: () => {
      console.log(' * input file has been processed, parsing rules file now...');
    },
  });

  const handleExistsRule = (rule) => {
    if (Object.keys(rule.attribute).length > 0) {
      const isPresent = tags.filter(tag => tag.name === rule.tag
        && isObjectSubset(tag, rule)).length > 0;
      if (!isPresent) outputContents += `The HTML does not have <${rule.tag} ${getTagAttrString(rule)}> tag\n`;
    } else {
      const isPresent = tags.filter(tag => tag.name === rule.tag).length > 0;
      if (!isPresent) outputContents += `The HTML does not have a ${rule.tag} tag\n`;
    }
  };


  const handleMoreRule = (rule) => {
    const tagCount = tags.filter(tag => tag.name === rule.tag).length;
    if (tagCount > rule.limit) outputContents += `There are more than ${rule.limit} ${rule.tag} tags in the HTML\n`;
  };


  const handleWithoutRule = (rule) => {
    const invalidTagCount = tags.filter(tag => tag.name === rule.tag
      && !_.has(tag.attribs, rule.attribute)).length;
    if (invalidTagCount > 0) outputContents += `The HTML has ${invalidTagCount} ${rule.tag} tags without ${rule.attribute} attribute\n`;
  };


  const writeToFile = (outputFilePath) => {
    fs.writeFile(outputFilePath, outputContents, (err) => {
      if (err) console.error(err);
      else console.log(' * rules file has been processed, please check output file');
    });
  };


  const ruleParser = new htmlparser.Parser({
    onopentag: (name, attribs) => {
      currentRule = {};
      currentRule.tag = name;
      if (attribs) {
        currentRule.attribute = attribs;
      }
    },

    ontext: (text) => {
      const rule = text.trim().split(/\s+/);
      switch (rule[0]) {
        case 'without':
          [, currentRule.attribute] = rule;
          handleWithoutRule(currentRule);
          break;

        case 'exists':
          handleExistsRule(currentRule);
          break;

        case 'more':
          [, currentRule.limit] = rule;
          handleMoreRule(currentRule);
          break;

        default:
          console.error(' * error: invalid rule encountered');
      }
    },

    onend: () => {
      console.log(' * rules file has been processed, please check output file');
    },
  });


  return {
    detectSEO: (args) => {
      let { inputFilePath, ruleFilePath, outputFilePath } = defaultPaths;

      if (!args.inputFilePath) console.warn(` * Info: input file path not specified, using default file at ${inputFilePath}\n`);
      if (!args.ruleFilePath) console.warn(` * Info: rule file path not specified, using default file at ${ruleFilePath}`);
      if (!args.outputFilePath) console.warn(` * Info: Output file path not specified, creating file at ${outputFilePath}`);

      inputFilePath = args.inputFilePath || defaultPaths.inputFilePath;
      ruleFilePath = args.ruleFilePath || defaultPaths.ruleFilePath;
      outputFilePath = args.outputFilePath || defaultPaths.outputFilePath;

      fs.readFile(inputFilePath, (error, data) => {
        if (error) console.error(error);
        else {
          inputHtmlparser.write(data);
          inputHtmlparser.end();
          fs.readFile(ruleFilePath, (err, data2) => {
            ruleParser.write(data2);
            ruleParser.end();
            writeToFile(outputFilePath);
          });
        }
      });
    },
  };
})();

module.exports = seoDetect;
