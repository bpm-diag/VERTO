import * as d3 from 'd3'
import Activity from './activity'
import Constraint from './constraint'
import { JSONModel, XMLModel } from './model'

export default class Data {
  constructor (_app) {
    this.app = _app
    this.modelId = this.uuid()
    this.modelName = 'verto'
    this.activities = {}
    this.constraints = {}
    this.selectedElement = null
    this.cacheKey = 'vertoDesignerModel'

    d3.select(document).on('keyup.app_data', (event) => {
      const e = event
      if (e.code === 'Delete' || e.code === 'MetaRight' || e.code === 'MetaLeft') {
        // delete current selected element
        if (this.selectedElement == null) return
        const element = this.getElement(this.selectedElement)
        if (element instanceof Activity) this.deleteActivity(element.id)
        else if (element instanceof Constraint) this.deleteConstraint(element.id)
        window.app.sidepanel.showGlobalMenu()
      }
      // console.log(event)
    })
  }

  uuid () {
    let dt = Date.now()
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (dt + Math.random() * 16) % 16 | 0
      dt = Math.floor(dt / 16)
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
    })
    return uuid
  }

  generateID () {
    let uuid = 0
    while (true) {
      uuid++
      let found = false
      for (const key in this.activities) {
        if (this.activities[key].id === uuid) {
          found = true
          break
        }
      }
      if (found) continue
      for (const key in this.constraints) {
        if (this.constraints[key].id === uuid) {
          found = true
          break
        }
      }
      if (!found) return uuid
    }
  }

  /*
  ACTIVITIES
  */
  getActivities () {
    const list = Object.values(this.activities).sort((a, b) => a.id - b.id)
    return (list === null) ? [] : list
  }

  getActivity (activityId) {
    return this.activities[activityId]
  }

  getActivitiesFromName (name) {
    const list = Object.values(this.activities).filter(a => a.name === name)
    if (list.length === 0) return undefined
    return list[0]
  }

  createActivity (id, position, select = false) {
    if (id === undefined || id === null) id = this.generateID()
    this.activities[id] = new Activity(id, position)
    if (select) this.selectElement(id)
    this.saveModelToCache()
    window.app.sidepanel.updateGlobalMenu()
    return this.activities[id]
  }

  deleteActivity (activityId) {
    const a = this.activities[activityId]
    if (a.id === this.selectedElement) this.selectedElement = null
    this.getConstraintsOfActivity(activityId).forEach(c => this.deleteConstraint(c.id))
    a.delete()
    delete this.activities[activityId]
    this.saveModelToCache()
    window.app.sidepanel.updateGlobalMenu()
  }

  /*
  CONSTRAINTS
  */
  getConstraints () {
    const list = Object.values(this.constraints).sort((a, b) => a.type.name.localeCompare(b.type.name))
    return (list == null) ? [] : list
  }

  getConstraint (constraintId) {
    return this.constraints[constraintId]
  }

  getConstraintsOfActivity (activityId) {
    return Object.values(this.constraints)
      .filter(c => { return c.sourceId === activityId || c.targetId === activityId })
  }

  createConstraint (id, sourceId, targetId, type, select = false) {
    if (id === undefined || id === null) id = this.generateID()
    this.constraints[id] = new Constraint(id, sourceId, targetId, type)
    this.getActivity(sourceId).addConstraint(id)
    this.getActivity(targetId).addConstraint(id)
    if (select) this.selectElement(id)
    this.saveModelToCache()
    window.app.sidepanel.updateGlobalMenu()
    return this.constraints[id]
  }

  deleteConstraint (constraintId) {
    const c = this.getConstraint(constraintId)
    if (c.id === this.selectedElement) this.selectedElement = null
    this.activities[c.sourceId].removeConstraint(c.id)
    this.activities[c.targetId].removeConstraint(c.id)
    c.delete()
    delete this.constraints[constraintId]
    this.saveModelToCache()
    window.app.sidepanel.updateGlobalMenu()
  }

  swapConstraintActivities (constraintId) {
    const c = this.getConstraint(constraintId)
    const newSourceId = c.targetId
    const newTargetId = c.sourceId
    const type = c.type
    //
    if (c.id === this.selectedElement) this.selectedElement = null
    this.activities[c.sourceId].removeConstraint(c.id)
    this.activities[c.targetId].removeConstraint(c.id)
    c.delete()
    delete this.constraints[constraintId]
    //
    this.createConstraint(constraintId, newSourceId, newTargetId, type, true)
  }

  /*
  * SELECTION
  */
  getElement (elementId) {
    const activity = this.getActivity(elementId)
    if (activity !== undefined) return activity
    const constraint = this.getConstraint(elementId)
    return constraint
  }

  selectElement (elementId) {
    if (this.selectedElement != null) this.getElement(this.selectedElement).setSelected(false)
    this.selectedElement = elementId
    const element = this.getElement(elementId).setSelected(true)
    if (element instanceof Activity) window.app.sidepanel.showActivityMenu(element)
    if (element instanceof Constraint) window.app.sidepanel.showConstraintMenu(element)
    return this
  }

  deselectAll () {
    if (this.selectedElement != null) this.getElement(this.selectedElement).setSelected(false)
    this.selectedElement = null
    window.app.sidepanel.showGlobalMenu()
    return this
  }

  deleteCurrentSelectedElement () {

  }

  /*
  MODEL
  */
  getXML () {
    const id = this.modelId
    const name = this.modelName
    const activities = this.getActivities()
    const constraints = this.getConstraints()
    const model = new XMLModel().id(id).name(name).activities(activities).constraints(constraints)
    return model.toString()
  }

  getJson () {
    const id = this.modelId
    const name = this.modelName
    const activities = this.getActivities()
    const constraints = this.getConstraints()
    const model = new JSONModel().id(id).name(name).activities(activities).constraints(constraints)
    return model.toString()
  }

  loadModelFromCache () {
    let model = null
    const str = window.localStorage.getItem(this.cacheKey)
    console.log('readed model from chace', str)
    if (str == null) return null
    try {
      model = new JSONModel(str)
    } catch (exception) {
      console.warn(exception)
      this.clearCache()
    }
    return model
  }

  saveModelToCache () {
    const str = this.getJson()
    window.localStorage.setItem(this.cacheKey, str)
    console.log('saved to chache', str)
  }

  clearCache () {
    window.localStorage.removeItem(this.cacheKey)
  }
}
