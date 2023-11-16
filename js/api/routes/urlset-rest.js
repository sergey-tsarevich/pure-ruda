import { AppDataSource } from '../../data-source.js'
import { Urlset } from '../../entity/Urlset-model.js'

/**
 * Start Ruda page.
 */
export const getRuda = (req, res) => {
  res.render('ruda/index')
}
export const getDiff = (req, res) => {
  res.render('ruda/diff')
}

// show the CRUD interface | GET
export async function getAll (req, res) {
  const repo = AppDataSource.getRepository(Urlset)
  const rows = await repo.find({
    select: {
      id: true,
      name: true,
      url: true,
      parseperiod: true,
      lastcheck: true,
      lastupdate: true,
      type: true,
      selectors: true,
      exclideselectors: true,
      replacefrom: true,
      replaceto: true,
      keeptags: true,
      enabled: true,
      status: true,
      imgasbase64: true,
      activationrule: true,
      conf: true
    },
    order: {
      enabled: 'DESC',
      lastupdate: 'DESC'
    }
  })

  res.json(rows)
}

// post data to DB | create/update
export async function post (req, res) {
  // validation
  if (!req.body.url) {
    res.status(422).json({ error: 'Url is required' })
    return
  }

  // get a post repository to perform operations with post
  const repo = AppDataSource.getRepository(Urlset)
  let aUrlset
  if (req.params.id) { // update
    aUrlset = await repo.findOneBy({
      id: req.params.id
    })
    delete req.body.id
    repo.merge(aUrlset, req.body)
  } else { // create a real post object from post json object sent over http
    aUrlset = repo.create(req.body)
  }

  // save received post
  await repo.save(aUrlset)

  // return saved post back
  res.send(aUrlset)
}

export async function patch (req, res) {
  // todo: add validation
  const repo = AppDataSource.getRepository(Urlset)
  const aUrlset = await repo.findOneBy({
    id: req.params.id
  })
  delete req.body.id
  repo.merge(aUrlset, req.body)
  await repo.save(aUrlset)

  // return full item back
  res.send(aUrlset)
}

// get data to update
export async function getById (req, res) {
  const repo = AppDataSource.getRepository(Urlset)

  const urlset = await repo.findOneBy({
    id: req.params.id
  })
  if (!urlset) {
    res.status(404)
    res.end()
    return
  }

  res.send(urlset)
}

// delete data
export async function deleteIt (req, res) {
  const repo = AppDataSource.getRepository(Urlset)

  const urlset = await repo.findOneBy({
    id: req.params.id
  })
  await repo.remove(urlset)

  res.sendStatus(200)
}
