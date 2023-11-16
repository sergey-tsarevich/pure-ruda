import { AppDataSource } from '../../data-source.js'
import { Urldata } from '../../entity/Urldata-model.js'
import { Urlset } from '../../entity/Urlset-model.js'
import { Brackets } from 'typeorm'

// show the CRUD interface | GET
export async function getAll (req, res) {
  const repo = AppDataSource.getRepository(Urldata)
  const rows = await repo.find({
    select: {
      id: true,
      urlsetid: true,
      parsed: true,
      source: true,
      reviewed: true,
      note: true
    },
    order: {
      id: 'DESC'
    }
  })
  res.json(rows)
}

export async function getActual (req, res) {
  const repo = AppDataSource.getRepository(Urldata)
  const latestUrlDataIdsQb = await repo.createQueryBuilder('u')
    .select('max(u.id)')
    .groupBy('u.urlsetid')
  // todo: try to remove fields hardcoding?
  const rows = await repo.createQueryBuilder('ud')
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
    // .getQueryAndParameters()
    // .getMany()
    .getRawMany()

  res.json(rows)
}

// post data to DB | create/update
export async function post (req, res) {
  // validation
  if (!req.body.content) {
    res.status(422).json({ error: 'Content is required' })
    return
  }
  // get a post repository to perform operations with post
  const repo = AppDataSource.getRepository(Urldata)
  let aUrldata
  if (req.params.id) { // update
    aUrldata = await repo.findOneBy({
      id: req.params.id
    })
    delete req.body.id
    repo.merge(aUrldata, req.body)
  } else { // create a real post object from post json object sent over http
    aUrldata = repo.create(req.body)
  }

  // save received post
  await repo.save(aUrldata)

  // return saved post back
  res.send(aUrldata)
}

export async function patch (req, res) {
  // todo: add validation
  const repo = AppDataSource.getRepository(Urldata)
  const aUrldata = await repo.findOneBy({
    id: req.params.id
  })
  delete req.body.id
  repo.merge(aUrldata, req.body)
  await repo.save(aUrldata)

  // return full item back
  res.send(aUrldata)
}

// get data to update
export async function getById (req, res) {
  const repo = AppDataSource.getRepository(Urldata)

  const urldata = await repo.findOneBy({
    id: req.params.id
  })
  if (!urldata) {
    res.status(404)
    res.end()
    return
  }

  res.send(urldata)
}

// delete data
export async function deleteIt (req, res) {
  const repo = AppDataSource.getRepository(Urldata)

  const urldata = await repo.findOneBy({
    id: req.params.id
  })
  await repo.remove(urldata)

  res.sendStatus(200)
}

// get diff between id1 and previous change of the same urlSet
export async function getPrevUrlData (req, res) {
  const id = req.query.id
  const urlsetid = req.query.urlsetid

  const prevContent = await AppDataSource.getRepository(Urldata).createQueryBuilder('u')
    .select('u.content as content')
    .where('u.urlsetid = :urlsetid', { urlsetid: urlsetid })
    .andWhere('u.id != :id', { id: id })
    .orderBy('u.id', 'DESC')
    .limit(1).getRawOne()

  res.json(prevContent)
}
