
// If absolute URL from the remote server is provided, configure the CORS
// header on that server.
var url = 'nmpereira_cv.pdf';

// Loaded via <script> tag, create shortcut to access PDF.js exports.
var pdfjsLib = window['pdfjs-dist/build/pdf'];

// The workerSrc property shall be specified.
pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';

var pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    //scale = 0.8,
    scale = 1,
    canvas = document.getElementById('the-canvas'),
    ctx = canvas.getContext('2d');

/**
 * Get page info from document, resize canvas accordingly, and render page.
 * @param num Page number.
 */
function renderPage(num) {
  pageRendering = true;
  // Using promise to fetch the page
  pdfDoc.getPage(num).then(function(page) {
    var viewport = page.getViewport({scale: scale});
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Render PDF page into canvas context
    var renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };
    var renderTask = page.render(renderContext);

    // Wait for rendering to finish
    renderTask.promise.then(function() {
      pageRendering = false;
      if (pageNumPending !== null) {
        // New page rendering is pending
        renderPage(pageNumPending);
        pageNumPending = null;
      }
    }).then(function() {
      // Returns a promise, on resolving it will return text contents of the page
      return page.getTextContent();
    }).then(function(textContent) {

      // Assign CSS to the textLayer element
      var textLayer = document.querySelector(".textLayer");

      textLayer.style.left = canvas.offsetLeft + 'px';
      textLayer.style.top = canvas.offsetTop + 'px';
      textLayer.style.height = canvas.offsetHeight + 'px';
      textLayer.style.width = canvas.offsetWidth + 'px';

      // Pass the data to the method for rendering of text over the pdf canvas.
      pdfjsLib.renderTextLayer({
        textContent: textContent,
        container: textLayer,
        viewport: viewport,
        textDivs: []
      });
    });
  });

  
  
}







/**
 * Asynchronously downloads PDF.
 */
pdfjsLib.getDocument(url).promise.then(function(pdfDoc_) {
  pdfDoc = pdfDoc_;


  // Initial/first page rendering
  renderPage(pageNum);
});

