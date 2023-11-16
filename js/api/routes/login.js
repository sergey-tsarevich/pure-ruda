import logger from '../util/logger.js'
import conf from 'config'
/**
 * GET /
 * Welcome page.
 */
export const getRoot = (req, res) => {
  if (req.session.user) {
    res.redirect('/ruda')
  } else {
    res.render('login')
  }
}
export const handleAll = (req, res, next) => {
  if (req.session.user) {
    next()
  } else {
    if (req.path === '/enter' || req.path.startsWith('/public')) {
      next()
    } else {
      res.redirect('/enter')
    }
  }
}
export const getEnter = (req, res) => {
  res.render('login', {})
}
export const postEnter = (req, res) => {
  logger.info('Do login', req.body)
  const login = req.body.login
  const pwd = req.body.password
  if (login === conf.login && pwd === conf.pwd) {
    req.session.user = req.body.login
    res.redirect('/')
  } else {
    res.render('login', {})
  }
}
export const getLogout = (req, res) => {
  logger.info('Do logout')

  req.session.destroy()
  res.render('login', {})
}
