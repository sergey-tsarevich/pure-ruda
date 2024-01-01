/**
 * Parse site data according to parsing rules for every site or according to defined query
 */
import cheerioOriginal from 'cheerio'
import cheerioAdv from 'cheerio-advanced-selectors'
import sanitizeHtml from 'sanitize-html'
import { diff_match_patch } from 'diff-match-patch'
import { isValidUrl } from './web-requester.js'

import urlLib from 'url'
import axios from 'axios'
import logger from './util/logger.js'
const cheerio = cheerioAdv.wrap(cheerioOriginal)
// set up DiffMatcher, see - https://code.google.com/archive/p/google-diff-match-patch/wikis/API.wiki
const dmp = new diff_match_patch()
dmp.Diff_Timeout = parseFloat('1')
dmp.Diff_EditCost = parseFloat('4')
export async function extractData (html, sitePref) {
  const $ = cheerio.load(html)
  let resultContent = ''
  if (!sitePref.selectors) {
    sitePref.selectors = 'body'
  }
  const select = $(sitePref.selectors)
  if (sitePref.exclideselectors) {
    select.find(sitePref.exclideselectors).remove()
  }
  select.each(function (i, elem) {
    resultContent += $(this).html()
  })
  if (sitePref.type === 'img') {
    if (sitePref.keeptags) {
      if (!sitePref.keeptags.includes('img')) {
        sitePref.keeptags += ',img'
      }
    } else {
      sitePref.keeptags = 'img'
    }
  }
  if (!sitePref.keeptags) {
    sitePref.keeptags = 'body'
  }
  resultContent = sanitizeHtml(resultContent, {
    allowedTags: sitePref.keeptags.split(','),
    allowedAttributes: {
      a: ['href', 'name', 'target'],
      td: ['rowspan', 'colspan'],
      img: ['src']
    }
  })
  if (sitePref.replacefrom) {
    const replaceFromArray = sitePref.replacefrom.split(',')
    const replaceToArray = sitePref.replaceto.split(',')
    for (let i = 0; i < replaceFromArray.length; i++) {
      const find = replaceFromArray[i]
      const re = new RegExp(find, 'g')
      resultContent = resultContent.replace(re, replaceToArray[i])
    }
  }
  resultContent = resultContent.replace(/<table/g, '<table border=1') // addTableBorderInHtml
  if (sitePref.type === 'img' || sitePref.imgasbase64) {
    resultContent = await correctImgUrls(resultContent, sitePref.url, sitePref.imgasbase64)
  }
  return resultContent
}
export async function correctImgUrls (resultContent, baseUrl, imgAsBase64) {
  const $ = cheerio.load(resultContent)
  const toBase64 = []
  $('img').each(function (i, elem) {
    const imgUrl = $(elem).attr('src')
    if (imgUrl) {
      let fullImgUrl = imgUrl
      if (!isValidUrl(imgUrl)) {
        const urlObj = new urlLib.URL(baseUrl)
        fullImgUrl = urlObj.protocol + '//' + urlObj.host + '/' + imgUrl
        $(elem).attr('src', fullImgUrl)
      }
      if (imgAsBase64) {
        toBase64.push(elem)
      }
    }
  })
  for (let i = 0; i < toBase64.length; i++) {
    const img = $(toBase64[i])
    logger.debug('Converting img %s to base64', img.attr('src'))
    try {
      const resp = await axios.get(encodeURI(img.attr('src')), { responseType: 'arraybuffer' })
      const base64Img = 'data:' + resp.headers['content-type'] + ';base64,' + Buffer.from(resp.data).toString('base64')
      img.attr('src', base64Img)
    } catch (e) {
      logger.error(e, 'Can not load img as base64')
    }
  }

  return $.html()
}
/**
 * Check if Html text is differ
 * @param oldHtml - previous html
 * @param newHtml - current html
 * @param sourceType - 'img' or 'html'
 * @param newTextHasOnlyDeletionsMode - if this mode is true then text is also equal if old html contains new html fully
 * @returns {boolean} - true if text is equal
 */
export function isTextEqual (oldHtml, newHtml, sourceType, newTextHasOnlyDeletionsMode) {
  if (sourceType !== 'img') {
    if (oldHtml) {
      oldHtml = sanitizeHtml(oldHtml,
        {
          allowedTags: [],
          allowedAttributes: []
        }).trim().replace(/[\t\s]/g, '')
    } else {
      oldHtml = ''
    }
    if (newHtml) {
      newHtml = sanitizeHtml(newHtml,
        {
          allowedTags: [],
          allowedAttributes: []
        }).trim().replace(/[\t\s]/g, '')
    } else {
      newHtml = ''
    }
    if (newTextHasOnlyDeletionsMode) {
      const diffs = dmp.diff_main(oldHtml, newHtml)
      dmp.diff_cleanupSemantic(diffs)
      // Each difference is an array
      // The first element specifies if it is an insertion (1), a deletion (-1) or an equality (0).
      return diffs.every(function (diff) {
        return (diff[0] !== 1) // no one contains insertions
      })
    }
  } else {
    if (oldHtml) {
      oldHtml = sanitizeHtml(oldHtml, {
        allowedTags: ['img'],
        allowedAttributes: { img: ['src'] }
      }).trim().replace(/[\t\s]/g, '')
    }
    if (newHtml) {
      newHtml = sanitizeHtml(newHtml, {
        allowedTags: ['img'],
        allowedAttributes: { img: ['src'] }
      }).trim().replace(/[\t\s]/g, '')
    }
  }
  return (oldHtml === newHtml)
}
// sanitizeHtml for diff
export function clearHtml (html) {
  return sanitizeHtml(html, {
    allowedTags: ['img'],
    allowedAttributes: { img: ['src'] }
  }).trim().replace(/[\t]/g, '')
    .replace(/[\s]{3,}/g, '\r\n\r\n')
}
export function getOnlyText (html) {
  return sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {}
  }).trim().replace(/[\t]/g, '')
    .replace(/[\s]{2,}/g, ' ')
}
