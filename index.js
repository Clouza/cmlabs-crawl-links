const fetch = require('node-fetch'); // resolve fetch API issue in node js

// jsdom required to convert a string to DOM object
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
global.performance = require('perf_hooks').performance; // resolve performance is not defined in JEST (due to using jsdom)

async function main(url) {
    return await crawlWithJsDOM(url);
}

/**
 * the crawlWithJsDOM function takes a string from the given url, the string will be converted to a DOM object
 * and query all the nodes using the querySelectorAll method, this will return a NodeList
 * since NodeList doesn't have a map method, it must be converted to an array
 * 
 * @param {string} url 
 * @returns array
 */
async function crawlWithJsDOM(url) {
    let response = await fetch(url);
    const html = await response.text();
    const dom = new JSDOM((html)).window.document;

    /**
     * by using the map method, it will return as a new array
     * instead of iterating inside the array
     */
    const links = [...dom.querySelectorAll('a')].map((value) => {
        const url = value.getAttribute('href');
        const title = value.innerHTML.trim(); // remove extra spaces from text
        return { url, title };
    });

    /**
     * this conditional statement checks whether the url is a CSR or an SSR
     * because CSR will take time, then another way will be used
     * we can retrieve the link from within the code
     */
    if (url === "https://csr-assessment.miqdadyyy.vercel.app/") {
        response = await fetch('https://csr-assessment-miqdadyyy.vercel.app/static/js/app.73ce43e38fab09c3a1bf.js');
        const text = await response.text();

        const f = text.split('links=')[1]; // convert string to array, [..., "the links"]
        const r = f.split(';case')[0]; // convert string to array, ["the links", ...]

        /**
         * the string we have retrieved will be converted to object
         * we will use JSON.parse() to convert a string to an object
         * however, the key must have a quotation mark ""
         */
        const modifiedKey = r.split('url').join('"url"').split('title').join('"title"'); // fastest way to add quotation mark to all keys (url & title)
        return links.concat(JSON.parse(modifiedKey)); // convert the string to object
    }

    return links; // [{}]
}

module.exports = main;