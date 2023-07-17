import VERTOActivityModel from './activityModel'
import VERTOConstraintModel from './constraintModel'
import { VERTOModelStringParsingError as StrError } from './error'

export default class VERTOModel {
  static fromString (str) {
    return parseFromString(str)
  }

  constructor () {
    this.fileType = 'VERTO'
    this.version = '1.0'
    this.data = {
      id: null,
      name: null,
      activities: [],
      constraints: []
    }
  }

  id (value) {
    if (value === undefined) return this.data.id
    this.data.id = value
    return this
  }

  name (value) {
    if (value === undefined) return this.data.name
    this.data.name = value
    return this
  }

  activities (value) {
    if (value === undefined) return this.data.activities
    this.data.activities = value
    return this
  }

  constraints (value) {
    if (value === undefined) return this.data.constraints
    this.data.constraints = value
    return this
  }

  toString () {
    return JSON.stringify(this, null, 2)
  }
}

/* ********************************************
**********        PARSER *********************
*********************************************/

function getAttr (obj, key) {
  if (key in obj) return obj[key]
  else throw new StrError(`[VERTOModel] Input obj has not key '${key}'`, obj)
}

function parseFromString (str) {
  if (typeof str !== 'string') throw StrError('Input str in not a string')
  try {
    const obj = JSON.parse(str)
    const model = new VERTOModel()

    model.id(getAttr(getAttr(obj, 'data'), 'id'))
    model.name(getAttr(getAttr(obj, 'data'), 'name'))
    model.activities(getAttr(getAttr(obj, 'data'), 'activities').map(a => VERTOActivityModel.fromString(JSON.stringify(a))))
    model.constraints(getAttr(getAttr(obj, 'data'), 'constraints').map(c => VERTOConstraintModel.fromString(JSON.stringify(c))))

    return model
  } catch (exc) {
    console.error(exc)
    throw new StrError('Cannot parser Input str as a json. Invalid format.')
  }
}
