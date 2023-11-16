import { EntitySchema } from 'typeorm'
import { Urlset } from './Urlset-model.js'

const booleanTransformer = {
  to (value) {
    return value && JSON.parse(value)
  },
  from (value) {
    // Do nothing
    return value
  }
}

const UrlsetSchema = new EntitySchema({
  name: 'Urlset',
  target: Urlset,
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true
    },
    name: {
      type: 'text',
      nullable: false
    },
    url: {
      type: 'text',
      nullable: false
    },
    parseperiod: {
      type: 'int',
      nullable: true
    },
    lastcheck: {
      type: 'numeric',
      nullable: true
    },
    lastupdate: {
      type: 'numeric',
      nullable: true
    },
    lastdata: {
      type: 'text',
      nullable: true
    },
    type: {
      type: 'text',
      nullable: true
    },
    selectors: {
      type: 'text',
      nullable: true
    },
    exclideselectors: {
      type: 'text',
      nullable: true
    },
    replacefrom: {
      type: 'text',
      nullable: true
    },
    replaceto: {
      type: 'text',
      nullable: true
    },
    keeptags: {
      type: 'text',
      nullable: true
    },
    enabled: {
      type: 'boolean',
      nullable: true,
      transformer: booleanTransformer
    },
    status: {
      type: 'int',
      nullable: true
    },
    imgasbase64: {
      type: 'boolean',
      nullable: true,
      transformer: booleanTransformer
    },
    activationrule: {
      type: 'text',
      nullable: true
    },
    conf: {
      type: 'text',
      nullable: true
    }
  }
})

export default UrlsetSchema
