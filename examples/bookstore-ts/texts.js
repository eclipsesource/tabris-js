var lorem = "Etiam nisl nisi, egestas quis lacus ut, tristique suscipit metus. In\nvehicula lectus metus, at accumsan elit fringilla blandit. Integer et quam\nsed dolor pharetra molestie id eget dui. Donec ac libero eu lectus dapibus\nplacerat eu a tellus. Fusce vulputate ac sem sit amet bibendum. Pellentesque\neuismod varius purus nec pharetra. Sed vitae ipsum sit amet risus vehicula\neuismod in at nunc. Sed in viverra arcu, id blandit risus. Praesent sagittis\nquis nisl  id molestie. Donec dignissim, nisl id volutpat consectetur, massa\ndiam aliquam lectus, sed euismod leo elit eu justo. Integer vel ante\nsapien.";
var authors = "<i>Authors of book covers:</i><br/>\nPaula Rodriguez - 1984<br/>\nMarc Storrs and Rob Morphy - Na Tropie Nieznanych<br/>\nCat Finnie - Stary Czlowiek I Morze<br/>\nAndrew Brozyna - Hobbit<br/>\nViacheslav Vystupov - Wojna Swiatow<br/>\nMarc Storrs and Rob Morphy - Zegar Pomaranczowy Pracz<br/>\nAndrew Evan Harner - Ksiega Dzungli";
exports.loremIpsum = [lorem, lorem, lorem].join("\n\n");
exports.license = {
    authors: authors,
    header: 'Book covers come under CC BY 2.0',
    link: {
        url: 'https://www.flickr.com/photos/ajourneyroundmyskull/sets/72157626894978086/',
        caption: 'Covers on flickr'
    }
};
