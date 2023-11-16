/* global describe, it */
import assert from 'assert'
import { Brackets } from 'typeorm'

import { Urlset } from '../../js/entity/Urlset-model.js'
import { AppDataSource } from '../../js/data-source.js'
import { Urldata } from '../../js/entity/Urldata-model.js'

describe('DB manager', async () => {
  it('DB test CRuD', async () => {
    const repo = AppDataSource.getRepository(Urlset)

    const uset = new Urlset()
    uset.name = 'wwww2'
    uset.url = 'wwww2.hrambel.by'

    await repo.save(uset)
    const rows = await repo.find()
    assert.equal(rows.length, 1, 'should be one urlset row')

    await repo.remove(uset)
  })

  it('Select actual UrlData', async () => {
    const latestUrlDataIdsQb = await AppDataSource
      .getRepository(Urldata)
      .createQueryBuilder('u')
      .select('max(u.id)')
      .groupBy('u.urlsetid')

    const result = await AppDataSource
      .getRepository(Urldata)
      .createQueryBuilder('ud')
      .select(['ud.id as id', 'ud.note as note', 'substr(ud.content,0,140) as content', 'ud.parsed as parsed',
        'ud.source as source', 'ud.reviewed as reviewed'])
      .leftJoin(Urlset, 'us', 'ud.urlsetid = us.id')
      .addSelect('us.name as name')
      .where('us.enabled = :enabled', { enabled: true })
      .andWhere(new Brackets((qb) => {
        qb.where('ud.reviewed = :reviewed', { reviewed: false })
          .orWhere('ud.note IS NOT NULL')
          .orWhere('ud.id IN (' + latestUrlDataIdsQb.getQuery() + ')')
      }))
      .orderBy('ud.id', 'DESC')
      .setParameters(latestUrlDataIdsQb.getParameters())
      .limit(2)
      .getQueryAndParameters()
      // .getMany()
      // .getRawMany()
    assert.match(result[0], /IN \(SELECT max\("u"."id"\) FROM "urldata" "u" GROUP BY "u"."urlsetid"\)\)/)
    // console.info(result)
  })
})
