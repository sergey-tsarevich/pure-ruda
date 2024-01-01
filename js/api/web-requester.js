/**
 * Makes HTTP or HTTPS web requests and returns unzipped, decoded, ready-to-parse html text
 */
import axios from 'axios'
import axiosRetry from 'axios-retry'
import iconvlite from 'iconv-lite'
import cheerio from 'cheerio'
import config from 'config'
import logger from './util/logger.js'

const UTF8_ENCODING = 'utf8'
// https://github.com/ashtuchkin/iconv-lite/wiki/Supported-Encodings
const HTML_2_ICONV_ENCODINGS = {
  'windows-1251': 'win1251',
  'koi8-r': 'koi8-r',
  'utf-8': 'utf8'
}
axiosRetry(axios, { retries: 3 })

export function isValidUrl (url) {
  return url.startsWith('http') || url.startsWith('//')
}
function addHttpToUrlIfMissed (url) {
  if (isValidUrl(url)) {
    return url
  }
  return 'http://' + url.trim()
}

export const getRawHtmlFrom = function (url) {
  return new Promise(function (resolve, reject) {
    url = addHttpToUrlIfMissed(url)
    axios.get(url, {
      headers: { 'User-Agent': config.userAgent },
      responseType: 'stream'
    }).then(function (response) {
      if (response.status === 200) {
        const buffers = []
        const stream = response.data
        stream.on('data', function (chunk) {
          buffers.push(chunk)
        })
        stream.on('end', function () {
          const utf8StringResponse = Buffer.concat(buffers).toString()
          const encoding = detectEncoding(response, utf8StringResponse)
          if (encoding === UTF8_ENCODING) {
            resolve(utf8StringResponse)
          } else {
            const encodedStr = iconvlite.decode(Buffer.concat(buffers), encoding)
            resolve(encodedStr)
          }
        })
        stream.on('error', function (error) {
          logger.error(error, 'HTTP response stream error: ', error.message)
        })
      } else {
        const httpError = new Error('Wrong status code: ' + response.status + ' for ' + url)
        //  - make axios like error
        httpError.response = response
        reject(httpError)
      }
    }).catch(function (error) {
      reject(error)
    })
  })
}
export function detectEncoding (response, utf8StringResponse) {
  let encoding = ''
  if (response) {
    const contentType = response.headers['content-type']
    encoding = getCharsetFrom(contentType)
  }
  if (!encoding) { // try to get encoding from html
    const $ = cheerio.load(utf8StringResponse)
    $('meta').each(function () {
      const charset = $(this).attr('charset') // <meta charset="utf-8"
      if (charset) {
        encoding = HTML_2_ICONV_ENCODINGS[charset.toLowerCase()]
      }
      // <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"
      const metaHttp = $(this).attr('http-equiv')
      if (metaHttp && metaHttp.toLowerCase() === 'content-type') {
        encoding = getCharsetFrom($(this).attr('content'))
      }
    })
  }
  if (!encoding) {
    logger.warn('%s has no encoding information in header and in meta tags, try to use %s!', response.data.responseUrl, UTF8_ENCODING)
    encoding = UTF8_ENCODING
  }
  return encoding
}
function getCharsetFrom (contentType) {
  let encoding
  const ctArray = contentType.toLowerCase().split('=')
  if (ctArray.length === 2) {
    const charset = ctArray[1] ? ctArray[1].trim() : ctArray[1]
    encoding = HTML_2_ICONV_ENCODINGS[charset]
  }
  return encoding
}
