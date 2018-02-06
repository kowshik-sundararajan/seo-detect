const fs = require('fs');
const path = require('path');
const htmlparser = require('htmlparser');

const raw = '<img alt="hello" /> <img /><p></p>';

let tags = [];

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
parser.parseComplete(raw);

let count = 0;
tags.forEach((item) => {
  if (item.name === 'img' && !item.attribs.alt) count += 1;
});
console.log(`There are ${count} <img> tags without alt attribute`);
