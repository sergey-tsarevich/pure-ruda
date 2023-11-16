// todo: think duplicates with backend Urlset

const URLSET = {
  id: 'id',
  name: 'name', // Parsing name
  url: 'url',
  parseperiod: 'parseperiod', // Parsing period in ms
  lastupdate: 'lastupdate', // Last time when UrlSet has data(content) updates
  lastcheck: 'lastcheck', // Last time when UrlSet has been checked for updates
  lastdata: 'lastdata',
  type: 'type', // 'img,html'
  selectors: 'selectors',
  exclideselectors: 'exclideselectors',
  replacefrom: 'replacefrom',
  replaceto: 'replaceto',
  keeptags: 'keeptags',
  enabled: 'enabled',
  status: 'status',
  imgasbase64: 'imgasbase64',
  activationrule: 'activationrule',
  conf: 'conf'
}
