import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@fortawesome/fontawesome-free/js/all'
import 'pretty-checkbox/src/pretty-checkbox.scss'

import './index.scss'
import Data from './js/data'
import Canvas from './js/canvas'
import ControlBar from './js/controlbar'
import SidePanel from './js/sidepanel'
import { ImportUtils, ExportUtils } from './js/importExport'
import { constraintTypes, getConstraintType } from './js/constraintTypes'

window.app = (new class {
  constructor () {
    this.init()
  }

  init (model) {
    this.data = new Data(this)
    this.canvas = new Canvas(this)
    this.controlBar = new ControlBar(this)
    this.sidepanel = new SidePanel(this)
    this.import = new ImportUtils(this)
    this.export = new ExportUtils(this)
    this.constraintTypes = constraintTypes

    if (model === undefined) model = this.data.loadModelFromCache()
    if (model !== undefined && model !== null) {
      console.log(model)
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
    /*
      if(true){
          let a1 = app.data.createActivity( {x:200, y:200} ).setName("A");
          let a2 = app.data.createActivity( {x:600, y:400} ).setName("B");
          //let a3 = app.data.createActivity( {x:300, y:500} ).setName("C");
          let c1 = app.data.createConstraint(a1.id, a2.id);
          //let c2 = app.data.createConstraint(a1.id, a3.id);
          //let c3 = app.data.createConstraint(a2.id, a3.id);
          //app.upload.openPopup();

          console.log(app.data.getXML());
      }
      */
  }

  /*
  getConstraintType (xmlName) {
    let type
    Object.values(this.constraintTypes).forEach(g => {
      Object.values(g).forEach(t => {
        if (t.xmlName === xmlName) type = t
      })
    })
    return type
  } */
}())
