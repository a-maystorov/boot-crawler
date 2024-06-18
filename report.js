/**
 * Prints a report of the pages and their link counts in a human-friendly format.
 *
 * @param {Object} pages - A dictionary where keys are page URLs and values are their link counts.
 */

function printReport(pages) {
  console.log("==========");
  console.log("REPORT");
  console.log("==========");
  const sortedPages = sortPages(pages);
  for (const sortedPage of sortedPages) {
    const url = sortedPage[0];
    const count = sortedPage[1];
    console.log(`Found ${count} internal links to ${url}`);
  }
}

/**
 * Sorts a dictionary of pages into a list of tuples (url, count) with the highest counts first.
 *
 * @param {Object} pages - A dictionary where keys are page URLs and values are their link counts.
 * @returns {Array.<[string, number]>} - A sorted array of tuples where each tuple contains a URL and its link count.
 */

function sortPages(pages) {
  // 2D array where the inner array: [ url, count ]
  const pagesArr = Object.entries(pages);
  pagesArr.sort((pageA, pageB) => {
    if (pageB[1] === pageA[1]) {
      return pageA[0].localeCompare(pageB[0]);
    }
    return pageB[1] - pageA[1];
  });
  return pagesArr;
}

export { printReport, sortPages };
