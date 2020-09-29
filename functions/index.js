const functions = require('firebase-functions');
const cors = require('cors')({origin: true})

const cheerio = require('cheerio')
const getUrl = require('get-urls')
const fetch = require('node-fetch')


const scrapeMetaTags = (text) =>{

    const urls = Array.from( getUrl(text))

    const requests = urls.map(async url =>{

        const res = await fetch(url)

        const html = await res.text()
        const $ = cheerio.load(html)

        const getMetaTag = (name) =>{
            $(`meta[name=${name}]`).attr('content')
        }

        return {
            url,
            title: $('title').first().text(),
            favicon: $('link[rel="icon"]').attr('href'),
            image: getMetaTag('image'),
            author: getMetaTag('author')
        }
    })

    return Promise.all(requests)
} 


exports.scrapper = functions.https.onRequest((req, res) =>{
    cors(req, res, async() => {
        const body = JSON.parse(req.body)
        const data = await scrapeMetaTags(body.text)

        res.send(data)
    })
})
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
