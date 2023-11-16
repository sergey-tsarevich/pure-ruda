import { EntitySchema } from 'typeorm'
import { Urldata } from './Urldata-model.js'

const UrldataSchema = new EntitySchema({
  name: 'Urldata',
  target: Urldata,
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true
    },
    urlsetid: {
      type: 'int',
      nullable: false
    },
    // data: { // Data is defined as individual facts, while information is the organization and interpretation of those facts.
    content: {
      type: 'text',
      nullable: false
    },
    parsed: { // --Parsing time
      type: 'numeric',
      nullable: true
    },
    source: { // duplicated from 'urlset' for history
      type: 'text',
      nullable: true
    },
    reviewed: {
      type: 'boolean',
      nullable: true,
      transformer: {
        to (value) {
          return value && JSON.parse(value)
        },
        from (value) {
          // Do nothing
          return value
        }
      }
    },
    note: { // just note
      type: 'text',
      nullable: true
    }
  }
})

export default UrldataSchema
