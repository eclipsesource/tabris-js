const {ImageView, ui} = require('tabris');

// Display a base64 encoded image in an ImageView

new ImageView({
  centerX: 0, centerY: 0, width: 96, height: 96,
  background: '#aaaaaa',
  scaleMode: 'fit',
  image: {
    src: 'data:image/png;base64,' +
    'iVBORw0KGgoAAAANSUhEUgAAADIAAAA5CAMAAABDJohAAAABS2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLv' +
    'u78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0i' +
    'QWRvYmUgWE1QIENvcmUgNS42LWMxMzggNzkuMTU5ODI0LCAyMDE2LzA5LzE0LTAxOjA5OjAxICAgICAgICAiPgogPHJkZjpSREYgeG1sbnM6' +
    'cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0i' +
    'Ii8+CiA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgo8P3hwYWNrZXQgZW5kPSJyIj8+IEmuOgAAAARnQU1BAACxjwv8YQUAAAABc1JHQgCuzhzp' +
    'AAADAFBMVEUAAADn1Hrm03jk0XHZvjzbwknexlTWuzPYvTnfyFnfyVzdxVHZvjzl0nfdxU/ex1Xbwkfm1HvZvjzp2YrjzmvizWfhzGTp2InX' +
    'uzXt353n1H3dxE3Zvz7gy2Hizmngyl/fx1nk0nXawUXbw0ndxlPXuzPs3JTcxE3fyFnYvDjgyl7jz2vdxlTgymDawELXuzbgyV3t4J7WuzTa' +
    'wELYvDr067/n1oHgzGXu36DXvDfXuzTXuzPgyl3VuC7cxE/UtynawEPcw0nfyVzWujL////92j7WujPWuTHr6+rr6unUujjt7/n92j/TtSLv' +
    '8//TtB3VuS3/4UD/3kDPtDDWujD92kDTtST//O/n48b51TDWuzT91y3VuCzQtTDqyjjVuCr/3j/VuTLRtjDUuDH//fPUtibTtSHr6+z/2TXV' +
    'uS752D3/3T7w9v//+Nn92DHTtibWuS/+20HUtyjSsxzStzHSsA/+2jv91inStCH/4ED/2R3UtR/62T/91y/91SXUuTL91B7StB/Xuzb/+Nb+' +
    '2Tf91SH90xz///3TuDHbvjPSsx7/3kH90xbXuzP+20TpyTfPtC/YvTLTshfs7e/v9f/+4F3/6o/+2z7Osy/+4FT/50L92T7+30/+5nj/+uP/' +
    '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' +
    'LXDkjK7/+C/UKmCXwVcZZgAAAABJRU5ErkJggg=='
  }
}).appendTo(ui.contentView);
