const lorem = `Etiam nisl nisi, egestas quis lacus ut, tristique suscipit metus. In
vehicula lectus metus, at accumsan elit fringilla blandit. Integer et quam
sed dolor pharetra molestie id eget dui. Donec ac libero eu lectus dapibus
placerat eu a tellus. Fusce vulputate ac sem sit amet bibendum. Pellentesque
euismod varius purus nec pharetra. Sed vitae ipsum sit amet risus vehicula
euismod in at nunc. Sed in viverra arcu, id blandit risus. Praesent sagittis
quis nisl  id molestie. Donec dignissim, nisl id volutpat consectetur, massa
diam aliquam lectus, sed euismod leo elit eu justo. Integer vel ante
sapien.`;


const authors = `<i>Authors of book covers:</i><br/>
Paula Rodriguez - 1984<br/>
Marc Storrs and Rob Morphy - Na Tropie Nieznanych<br/>
Cat Finnie - Stary Czlowiek I Morze<br/>
Andrew Brozyna - Hobbit<br/>
Viacheslav Vystupov - Wojna Swiatow<br/>
Marc Storrs and Rob Morphy - Zegar Pomaranczowy Pracz<br/>
Andrew Evan Harner - Ksiega Dzungli`;




export const loremIpsum = [lorem, lorem, lorem].join("\n\n");
export const license = {
  authors,
  header: 'Book covers come under CC BY 2.0',
  link: {
    url: 'https://www.flickr.com/photos/ajourneyroundmyskull/sets/72157626894978086/',
    caption: 'Covers on flickr'
  }
};
