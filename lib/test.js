const seoDetect = require('./index.js');
const argv = require('minimist')(process.argv.slice(2));

const INPUT_FILE_PATH = argv.in;
const RULE_FILE_PATH = argv.rule;
const OUTPUT_FILE_PATH = argv.out || './output.txt';

const input = {
  inputFilePath: INPUT_FILE_PATH,
  ruleFilePath: RULE_FILE_PATH,
  outputFilePath: OUTPUT_FILE_PATH,
};

seoDetect.detectSEO(input);
