import * as raspisanieRequester from '../UrlProcessor.js'
import logger from '../util/logger.js'

export const postCheckSiteparse = (req, res) => {
  raspisanieRequester.parseSite(req.body).then(function (parsedRasp) {
    res.json({ value: parsedRasp })
  }).catch(function (err) {
    res.json({ error: err })
  })
}
/**
 * Force parsing active siteParsePrefs for all periods.
 */
export const getUpdateAllActive = (req, res) => {
  raspisanieRequester.runRequester(true)
  res.send('Started...')
}
export const postForceSiteparse = (req, res) => {
  const urlSetUrl = req.body.url
  raspisanieRequester.parseSiteAndSave(req.body).then(function (parsedRasp) {
    logger.info('OK parsing data for ' + urlSetUrl)
    res.json({ value: parsedRasp })
  }).catch(function (err) {
    res.json({ error: err })
  })
}
