import logger from '../util/logger.js'
import { AppDataSource } from '../../data-source.js'
import { Urlset } from '../../entity/Urlset-model.js'

export async function updateStatus (sitePref, status) {
  const repo = AppDataSource.getRepository(Urlset)
  await repo.update({ id: sitePref.id }, {
    status,
    lastcheck: Date.now()
  })

  logger.debug('SitePrefId %s lastcheck and status updated to %s', sitePref.url + ' [id]=' + sitePref.id, status)
}

export async function updateLastCheck (sitePref) {
  const repo = AppDataSource.getRepository(Urlset)
  sitePref.lastcheck = Date.now()
  await repo.save(sitePref)

  logger.debug('SitePrefId ' + sitePref.id + ' lastcheck updated.')
}

export function isAcitivationRuleFailed (content, rule) {
  if (!rule || !rule.trim()) {
    return false
  }
  // todo: security check
  // content = content + ''
  rule = rule.replaceAll('this', '') // return bad content!
  rule = rule.replaceAll('global', '') // return bad content!
  rule = rule.replaceAll('process', '') // return bad content!
  rule = rule.replaceAll('fetch', '') // return bad content!
  rule = rule.replaceAll('console', '') // return bad content!
  let isFailed = true
  try {
    isFailed = !(new Function('content', 'return ' + rule)(content)) // todo: review security issues: all globals are available!!! => replace by json?
  } catch (e) {
    logger.error(e, 'Fail to apply activation rule %s', rule)
    isFailed = true
  }

  return isFailed
}
