import { DataSource } from 'typeorm'
import UrlsetSchema from './entity/Urlset-schema.js'
import UrldataSchema from './entity/Urldata-schema.js'
import conf from 'config'
import logger from './api/util/logger.js'

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: conf.sqliteDbPath,
  synchronize: true,
  // logging: ['query', 'error'],
  logging: ['error'],
  maxQueryExecutionTime: 1000, // If you have performance issues - Log long-running queries
  enableWAL: true, // https://github.com/WiseLibs/better-sqlite3/blob/master/docs/performance.md
  entities: [
    UrlsetSchema,
    UrldataSchema
  ],
  subscribers: [],
  migrations: []
})

// to initialize initial connection with the database, register all entities
// and "synchronize" database schema, call "initialize()" method of a newly created database
// once in your application bootstrap
AppDataSource.initialize()
  .then(() => {
    logger.info('DB init OK!')
  })
  .catch((error) => logger.error(error))
