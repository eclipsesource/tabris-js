const ConvertizeMap = {
  color: 'textColor',
  align: 'alignment'
};

export class CSSParser {
  constructor(fileOrText) {
    if (typeof fileOrText === 'string') {
      if (fileOrText.includes('{') && fileOrText.includes('}')) {
        this.css = JSON.parse(fileOrText);
      } else {
        this.css = JSON.parse(require(fileOrText));
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
