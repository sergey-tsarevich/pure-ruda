/**
 * API: https://discordapp.com/developers/#execute-webhook
 * https://support.discordapp.com/hc/en-us/articles/228383668
 */
import conf from 'config'
import logger from '../util/logger.js'
import axios from 'axios'
const MAX_MESSAGE_LEGTH = 2000
const discordUrl = conf.discordUrl
const discordNotificationEnabled = conf.discordNotificationEnabled
const notifyDiscord = function (msgText) {
  if (!discordNotificationEnabled) { return }
  if (msgText.length > MAX_MESSAGE_LEGTH) {
    msgText = msgText.substring(0, MAX_MESSAGE_LEGTH - 5) + '...'
  }
  axios.post(discordUrl, { content: msgText.substring(0, 1999) }).then(function (res) {
    if (res.status === 204) {
      logger.info('Notification Discord was sent.')
    } else {
      logger.error('Can not send msg to Discord ', discordUrl, ' : ', res.status)
    }
  }).catch(function (error) {
    logger.error(error, 'Discord: can not request url on parse: %s', discordUrl)
  })
}
export default notifyDiscord
