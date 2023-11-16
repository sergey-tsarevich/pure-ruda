import logger from '../util/logger.js'
import conf from 'config'
import notifyDiscord from './discord-notificator.js'
import sanitizeHtml from 'sanitize-html'
const DELAY_IN_MS = 7000
const notificators = [notifyDiscord]
let msgTextBuffer = ''

export function isTextValid (text, type) {
  if (text) {
    if (type === 'html') {
      text = sanitizeHtml(text,
        {
          allowedTags: [],

          allowedAttributes: []
        }).replace(/[\t\s]/g, '')
    }
    return text.trim().length > conf.minValidTextLenght
  } else {
    return false
  }
}
export function notifyWarning (siteParsePref) {
  if (!msgTextBuffer) {
    setTimeout(send, DELAY_IN_MS)
  }
  msgTextBuffer += makeWarningText(siteParsePref) + '\n'
}
function send () {
  for (let i = 0; i < notificators.length; i++) {
    notificators[i](msgTextBuffer)
  }
  msgTextBuffer = ''
}
function makeWarningText (siteParsePref) {
  const msgText = 'Wrong text for ' + siteParsePref.url + ' : Pref.id = ' + siteParsePref.id
  logger.warn('Invalid Text parsed: ', msgText)
  return msgText
}
