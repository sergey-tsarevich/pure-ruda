import * as webRequester from './web-requester.js'
import * as htmlParser from './html-parser.js'
import * as notificator from './notification/notification-dispatcher.js'

import { Raw } from 'typeorm'
import { AppDataSource } from '../data-source.js'
import { Urldata } from '../entity/Urldata-model.js'
import { Urlset } from '../entity/Urlset-model.js'
import { handleModules } from './modules-handler.js'

import config from 'config'
import logger from './util/logger.js'
import * as siteprefService from './service/sitepref-service.js'
import { TOO_SMALL_RESPONSE_TEXT_STATUS, ACTIVATION_RULE_FAILED_STATUS } from './util/consts.js'

export async function runRequester (allPeriods) {
  logger.info('Started sqlite3 requester to get shcedule...')
  const findOptions = {
    enabled: true
  }
  if (!allPeriods) {
    const currUnixTimeInSec = Date.now()
    findOptions.lastcheck = Raw((alias) => `(${alias} IS NULL OR ${alias} = '' OR ${alias} < (:currUnixTimeInSec - parseperiod))`, { currUnixTimeInSec })
  }
  const repo = AppDataSource.getRepository(Urlset)
  const rows = await repo.findBy(findOptions)

  if (rows.length === 0) {
    logger.info('No active URL sets have been found. Finishing.')
  } else {
    logger.info('Found %d sitePrefs (site prefs). Start parsing...', rows.length)
    rows.forEach(function (siteParsePref) {
      parseSiteAndSave(siteParsePref).then(function (msg) {
        logger.info(`OK parsing data for ${siteParsePref.url}.`)
      }).catch(function (err) {
        logger.error(err, "ERROR: Can't parse site " + siteParsePref.url + ' : ' + err.message)
      })
    })
  }
}

export function parseSiteAndSave (siteParsePref) {
  return new Promise(function (resolve, reject) {
    const url = siteParsePref.url
    webRequester.getRawHtmlFrom(url).then(async function (rawHtml) {
      const resultContent = await htmlParser.extractData(rawHtml, siteParsePref)
      if (!notificator.isTextValid(resultContent, siteParsePref.type)) {
        if (siteParsePref.status !== TOO_SMALL_RESPONSE_TEXT_STATUS) {
          siteprefService.updateStatus(siteParsePref, TOO_SMALL_RESPONSE_TEXT_STATUS)
          const errMessage = `HTTP status code was changed from ${siteParsePref.status} to BAD_CONTENT(too small response text)  for ${siteParsePref.url}`
          logger.warn(errMessage)
          notificator.notifyWarning(siteParsePref, true)
        } else {
          siteprefService.updateLastCheck(siteParsePref)
          logger.warn(`HTTP status code is still BAD_CONTENT(too small response text) for ${siteParsePref.url}`)
        }
        reject('Too small response text')
        return
      }
      // get last pars to compare if the same
      if (htmlParser.isTextEqual(siteParsePref.lastdata, resultContent, siteParsePref.type, config.newHtmlTextEqualsIfHasOnlyDeletions)) {
        logger.info('SiteData is the same for (%s). Skip update.', siteParsePref.url)
        siteprefService.updateStatus(siteParsePref, 200)
        resolve('Url content is the same as previous.')
        return
      }
      // apply activation rule
      if (siteprefService.isAcitivationRuleFailed(siteParsePref.lastdata, siteParsePref.activationrule)) {
        logger.info('SiteData activation rule has been failed for (%s). Skip update.', siteParsePref.activationrule)
        siteprefService.updateStatus(siteParsePref, ACTIVATION_RULE_FAILED_STATUS)
        resolve('SiteData activation rule has been failed.')
        return
      }

      const currUnixTimeInSec = Date.now()
      const siteData = {
        urlsetid: siteParsePref.id,
        parsed: currUnixTimeInSec,
        content: resultContent,
        source: siteParsePref.url
      }
      const repoUrldata = AppDataSource.getRepository(Urldata)
      const savedUrlData = await repoUrldata.save(siteData)
      handleModules(resultContent, siteParsePref.url, siteParsePref.conf, savedUrlData.id)

      const repoUrlset = AppDataSource.getRepository(Urlset)
      await repoUrlset.update({ id: siteParsePref.id }, {
        status: 200,
        lastdata: resultContent,
        lastupdate: currUnixTimeInSec,
        lastcheck: currUnixTimeInSec
      })
      logger.debug('Data from %s updated successfully.', siteParsePref.url)
      resolve(resultContent)
    }).catch(function (err) {
      const status = err.response ? err.response.status : undefined
      if (status) {
        if (siteParsePref.status !== status) {
          logger.warn(`HTTP status code was changed from ${siteParsePref.status} to ${status} for ${siteParsePref.url}`) // todo:notify warning
          siteprefService.updateStatus(siteParsePref, status)
        } else {
          siteprefService.updateLastCheck(siteParsePref)
          logger.error(`HTTP status code is still wrong ${status} for ${siteParsePref.url}`)
        }
      } else { // site is not available
        if (siteParsePref.status === 0) {
          siteprefService.updateLastCheck(siteParsePref)
          logger.debug(err)
        } else {
          siteprefService.updateStatus(siteParsePref, 0)
        }
        logger.warn('Zero status(not available?) for (' + siteParsePref.url + ') : ' + err.message)
      }
      reject('Error handled: ' + err.message)
    })
  })
}

export async function parseSite (siteParsePref) {
  return new Promise(function (resolve, reject) {
    webRequester.getRawHtmlFrom(siteParsePref.url).then(async function (rawHtml) {
      siteParsePref.imgasbase64 = false
      const parsedHtml = await htmlParser.extractData(rawHtml, siteParsePref)
      resolve(parsedHtml)
    }).catch(function (err) {
      reject(err.message)
    })
  })
}
