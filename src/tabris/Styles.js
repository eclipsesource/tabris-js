const Converter = require('css-to-js-object');

const ConvertizeMap = {
  color: 'textColor'
  , align: 'alignment'
};

export class CSSParser {
  constructor(fileOrText) {
    if (typeof fileOrText === 'string') {
      if (fileOrText.includes('{') && fileOrText.includes('}')) {
        this.css = Converter(fileOrText);
      } else {
        this.css = Converter(require(fileOrText));
      }
    }
  }
  convertTo() {
    Object.keys(this.css)
      .map(key => {
        if (ConvertizeMap[key]) {
          this.css[ConvertizeMap[key]] = this.css[key];
          delete this.css[key];
        }
      });
    return this.css;
  }
}

export default function(input) {
  return new CSSParser(input)
    .convertTo();
}
