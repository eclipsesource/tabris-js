import {PdfView, contentView, AlertDialog, ActivityIndicator} from 'tabris';

contentView.append(
  <$>
    <PdfView stretch
        zoomEnabled
        pageElevation={4}
        padding={[24, 16]}
        background='#efefef'
        spacing={16}
        onLoad={handleLoad}/>
    <ActivityIndicator center/>
  </$>
);

/** @param {tabris.PdfViewLoadEvent} ev */
function handleLoad(ev) {
  $(ActivityIndicator).dispose();
  if (ev.error) {
    AlertDialog.open('Failed to load PDF Document');
  }
}

(async () => {
  const response = await fetch('https://tabrisjs.com/downloads/ebook/tabrisjs-3.5.0.pdf');
  $(PdfView).only().src = await response.blob();
})().catch(console.error);
