const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const htmlparser = require('htmlparser');

const FILE_PATH = './index.html';
const tags = [];

const handler = new htmlparser.DefaultHandler((error, dom) => {
  if (error) console.error(error);
  else {
    dom.forEach((item) => {
      tags.push({
        name: item.name,
        attribs: item.attribs || {},
      });
    });
  }
}, { ignoreWhitespace: true });

const parser = new htmlparser.Parser(handler);

fs.readFile(FILE_PATH, (error, data) => {
  if (error) console.error(error);
  else {
    parser.parseComplete(data);
    let ruleOneCount = 0;
    let ruleTwoCount = 0;
    let ruleThreeCount = 0;
    let ruleFourCount = 0;
    let ruleFiveCount = 0;
    tags.forEach((item) => {
      if (item.name === 'img' && !_.has(item.attribs, 'alt')) ruleOneCount += 1;
      else if (item.name === 'a' && !_.has(item.attribs, 'rel')) { console.log(item); ruleTwoCount += 1; }
      else if (item.name === 'head') {
        if (item.children) {
          let hasTitle = false;
          item.children.forEach((child) => {
            if (child.name === 'title') hasTitle = true;
          });
          if (!hasTitle) ruleThreeCount += 1;
        }
      }
      console.log(item);
    });
    console.log(`There are ${ruleOneCount} <img> tags without alt attribute`);
    console.log(`There are ${ruleTwoCount} <a> tags without rel attribute`);
    console.log(`There are ${ruleThreeCount} <a> tags without rel attribute`);
    console.log(`There are ${ruleFourCount} <a> tags without rel attribute`);
    console.log(`There are ${ruleFiveCount} <a> tags without rel attribute`);
  }
});
