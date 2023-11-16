import 'reflect-metadata'

// === Web_scraping ===
// review also https://github.com/lapwinglabs/x-ray
import express from 'express'
import bodyParser from 'body-parser'
import conf from 'config'
import { CronJob } from 'cron'
import session from 'client-sessions'
import logger from './api/util/logger.js'
import * as requester from './api/UrlProcessor.js'
import errorHandler from 'errorhandler'
import * as loginController from './api/routes/login.js'
import * as runController from './api/routes/siteparse-run.js'
import * as urlsetController from './api/routes/urlset-rest.js'
import * as urldataController from './api/routes/urldata-rest.js'
import { AppDataSource } from './data-source.js'

const app = express()
const env = process.argv[2] || process.env.NODE_ENV || 'development'
app.set('env', env)
app.use(express.static('./views/public'))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 })) // support x-www-form-urlencoded
app.use(bodyParser.json({ limit: '50mb' }))
/* Set EJS template Engine */
app.set('views', 'views')
app.set('view engine', 'ejs')
app.use(session({
  cookieName: 'session',
  secret: 'info.by',
  duration: 70 * 24 * 60 * 60 * 1000,
  activeDuration: 70 * 24 * 60 * 60 * 1000
}))
/**
 * App routes.
 */
app.all('/*', loginController.handleAll)
app.get('/', loginController.getRoot)
app.get('/enter', loginController.getEnter)
app.post('/enter', loginController.postEnter)
app.get('/logout', loginController.getLogout)

// *** check siteparse route
app.get('/update-all-active', runController.getUpdateAllActive)
app.post('/check-siteparse', runController.postCheckSiteparse)
app.post('/force-siteparse', runController.postForceSiteparse)
// NEW
app.get('/ruda', urlsetController.getRuda)
app.get('/ruda/diff', urlsetController.getDiff)

app.get('/ruda/api/urlset', urlsetController.getAll)
app.post('/ruda/api/urlset', urlsetController.post)
app.get('/ruda/api/urlset/:id', urlsetController.getById)
app.patch('/ruda/api/urlset/:id', urlsetController.patch)
app.delete('/ruda/api/urlset/:id', urlsetController.deleteIt)

app.get('/ruda/api/urldata', urldataController.getAll)
app.get('/ruda/api/urldata/actual', urldataController.getActual)
app.get('/ruda/api/urldata/prev', urldataController.getPrevUrlData)
app.post('/ruda/api/urldata', urldataController.post)
app.get('/ruda/api/urldata/:id', urldataController.getById)
app.patch('/ruda/api/urldata/:id', urldataController.patch)
app.delete('/ruda/api/urldata/:id', urldataController.deleteIt)

/**
 * Error Handler.
 */
if (process.env.NODE_ENV === 'production') {
  app.use((err, req, res, next) => {
    logger.error(err, 'Server ERROR: req{}: ' + req + ' |res{}: ' + res + ' | ' + err.message)
    res.status(err.status || 500).send('Server Error')
  })
} else {
  app.use(errorHandler())
}
// do not use this in modules, but only in applications, as otherwise we could have multiple of these bound
process.on('uncaughtException', function (err) {
  logger.error(err, 'GLOBAL ERROR: ')
})

// start cron
const cron = new CronJob(conf.get('cronSchedule'), function () {
  logger.info('++++++ Cron job started...')
  requester.runRequester(false)
}, function () {
  logger.error('CronJob completed! Please check the parameters!')
}, false, 'Europe/Minsk')
cron.start()
const server = app.listen(conf.serverPort, function () {
  logger.info('App is running at http://localhost:%d in %s mode', conf.serverPort, app.get('env'))
  logger.info('  Press CTRL-C to stop\n')
})

async function closeGracefully (signal) {
  logger.info('Stopping ...')
  await server.close()
  AppDataSource.destroy()
  process.exit(0)
}

process.on('SIGINT', closeGracefully)
