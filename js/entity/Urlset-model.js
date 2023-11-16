export class Urlset {
  constructor (id, name, url, parseperiod, lastcheck, lastupdate, lastdata, type, selectors,
    exclideselectors, replacefrom, replaceto, keeptags, enabled, status, imgasbase64, activationrule, conf) {
    this.id = id
    this.name = name
    this.url = url
    this.parseperiod = parseperiod
    this.lastcheck = lastcheck
    this.lastupdate = lastupdate
    this.lastdata = lastdata
    this.type = type
    this.selectors = selectors
    this.exclideselectors = exclideselectors
    this.replacefrom = replacefrom
    this.replaceto = replaceto
    this.keeptags = keeptags
    this.enabled = enabled
    this.status = status
    this.imgasbase64 = imgasbase64
    this.activationrule = activationrule
    this.conf = conf
  }
}
