import ControlBar from './controlbar'
import Data from './data'
import Canvas from './canvas'
import Sidepanel from './sidepanel'
import Import from './import'
import Export from './export'
import { getConstraintType } from './constraintTypes'

export default class App {
  constructor () {
    this.data = null
    this.canvas = null
    this.controlBar = null
    this.sidepanel = null
    this.import = null
    this.export = null
  }

  init (model) {
    this.data = new Data()
    this.canvas = new Canvas()
    this.controlBar = new ControlBar(this)
    this.sidepanel = new Sidepanel()
    this.import = new Import()
    this.export = new Export()

    // if model == null -> is setted to start a new project
    // if model == undefined -> load from cache

    if (model === undefined) model = this.data.loadModelFromCache()
    if (model !== undefined && model !== null) {
      model.data.activities.forEach(a => {
        this.data.createActivity(a.id, { x: a.x, y: a.y }).setName(a.name)
      })
      model.data.constraints.forEach(c => {
        const sourceId = (c.sourceActivityId == null || c.sourceActivityId === '') ? this.data.getActivitiesFromName(c.sourceActivityName) : c.sourceActivityId
        const targetId = (c.targetActivityId == null || c.targetActivityId === '') ? this.data.getActivitiesFromName(c.targetActivityName) : c.targetActivityId
        const type = getConstraintType(c.xmlName)
        this.data.createConstraint(c.id, sourceId, targetId, type)
      })
    }
  }
}
