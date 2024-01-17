import logger from '../api/util/logger.js'
import notifyDiscord from '../api/notification/discord-notificator.js'

/**
 * Sent changes to Discord.
 * Add `urlSetConf.discord = true` to enable.
 */
export async function handle (
  content,
  source,
  urlSetConf,
  urlDataId,
  urlSetName
) {
  if (!urlSetConf?.trim()) {
    return // or write to note hbLink?
  }
  let confJson
  try {
    confJson = JSON.parse(urlSetConf)
  } catch (e) {
    logger.error(e, 'Wrong JSON in urlSetConf')
    return
  }
  if (!confJson?.discord) {
    return
  }

  logger.debug(
    '[discord-info_module] Going to sent %s changes to Discord.',
    source
  )
  notifyDiscord(`<a href=${source}>${urlSetName}</a> was updated: ${content}`)
}
