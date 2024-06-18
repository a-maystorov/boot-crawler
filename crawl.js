import { JSDOM } from "jsdom";

/**
 * Normalize a URL by removing the scheme (http, https),
 * 'www.' subdomain (if present), and ensuring the pathname
 * does not end with a slash.
 *
 * @param {string} url - The URL to be normalized.
 * @returns {string} - The normalized URL.
 */
function normalizeURL(url) {
  // Parse the URL
  const parsedURL = new URL(url);

  // Extract the hostname and pathname
  let hostname = parsedURL.hostname;
  let pathname = parsedURL.pathname;

  // Remove 'www.' if present
  if (hostname.startsWith("www.")) {
    hostname = hostname.slice(4);
  }

  // Ensure the pathname does not end with a slash
  if (pathname.endsWith("/")) {
    pathname = pathname.slice(0, -1);
  }

  const normalizedURL = `${hostname}${pathname}`.toLowerCase();

  return normalizedURL;
}

/**
 * Extracts URLs from HTML content and converts relative URLs to absolute URLs using the base URL.
 *
 * @param {string} html - The HTML content to parse.
 * @param {string} baseURL - The base URL to resolve relative URLs.
 * @returns {string[]} - An array of absolute URLs extracted from the HTML content.
 */
function getURLsFromHTML(html, baseURL) {
  const dom = new JSDOM(html);
  const anchors = Array.from(dom.window.document.querySelectorAll("a[href]"));

  return anchors
    .map((anchor) => {
      try {
        // Convert relative URLs to absolute URLs using the base URL
        return new URL(anchor.getAttribute("href"), baseURL).href;
      } catch (err) {
        console.log(`${err.message}: ${anchor.getAttribute("href")}`);
        return null;
      }
    })
    .filter((url) => url !== null);
}

/**
 * Fetch the HTML content of a given URL.
 *
 * @param {string} url - The URL to fetch HTML content from.
 * @returns {Promise<string>} - A promise that resolves to the HTML content as a string.
 * @throws {Error} - Throws an error if the network request fails or the response is not HTML.
 */
async function fetchHTML(url) {
  let res;
  try {
    res = await fetch(url);
  } catch (err) {
    throw new Error(`Got Network error: ${err.message}`);
  }

  if (res.status > 399) {
    throw new Error(`Got HTTP error: ${res.status} ${res.statusText}`);
  }

  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("text/html")) {
    throw new Error(`Got non-HTML response: ${contentType}`);
  }

  return res.text();
}

/**
 * Crawl a webpage and its linked pages, starting from the base URL.
 *
 * @param {string} baseURL - The base URL to start crawling from.
 * @param {string} [currentURL=baseURL] - The current URL being crawled.
 * @param {Object} [pages={}] - An object to keep track of visited pages and their visit counts.
 * @returns {Promise<Object>} - A promise that resolves to an object containing normalized URLs as keys and their visit counts as values.
 */
async function crawlPage(baseURL, currentURL = baseURL, pages = {}) {
  // if this is an offsite URL, bail immediately
  const currentURLObj = new URL(currentURL);
  const baseURLObj = new URL(baseURL);
  if (currentURLObj.hostname !== baseURLObj.hostname) {
    return pages;
  }

  // use a consistent URL format
  const normalizedURL = normalizeURL(currentURL);

  // if we've already visited this page
  // just increase the count and don't repeat
  // the http request
  if (pages[normalizedURL] > 0) {
    pages[normalizedURL]++;
    return pages;
  }

  // initialize this page in the map
  // since it doesn't exist yet
  pages[normalizedURL] = 1;

  // fetch and parse the html of the currentURL
  console.log(`crawling ${currentURL}`);
  let html = "";
  try {
    html = await fetchHTML(currentURL);
  } catch (err) {
    console.log(`${err.message}`);
    return pages;
  }

  // recur through the page's links
  const nextURLs = getURLsFromHTML(html, baseURL);
  for (const nextURL of nextURLs) {
    pages = await crawlPage(baseURL, nextURL, pages);
  }

  return pages;
}

export { normalizeURL, getURLsFromHTML, fetchHTML, crawlPage };
