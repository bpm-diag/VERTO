import * as d3 from 'd3'
import '../css/sidepanel.scss'

export default class SidePanel {
  constructor (app) {
    this.app = app
    this.globalMenu = d3.select('#sidepanel .global-menu').style('display', null)
    this.activityMenu = d3.select('#sidepanel .activity-menu').style('display', 'none')
    this.constraintMenu = d3.select('#sidepanel .constraint-menu').style('display', 'none')
    this.counterActivities = d3.select('#sidepanel #num-activities')
    this.counterConstraints = d3.select('#sidepanel #num-constraints')
    this.updateGlobalMenu()
  }

  removeAll () {
    this.globalMenu.style('display', 'none')
    this.activityMenu.style('display', 'none')
    this.constraintMenu.style('display', 'none')
  }

  showGlobalMenu () {
    this.removeAll()
    this.updateGlobalMenu()
    this.globalMenu.style('display', null)
  }

  showActivityMenu (activity) {
    this.removeAll()
    this.activityMenu.select('.activity-id').text(activity.id)
    this.activityMenu.select('.delete-activity')
      .on('click', () => {
        this.app.data.deleteActivity(activity.id)
        this.showGlobalMenu()
      })
    this.activityMenu.select('.activity-name')
      .property('value', activity.name)
      .on('keyup', function () {
        const name = d3.select(this).property('value')
        activity.setName(name)
      })
    this.activityMenu.style('display', null)
  }

  showConstraintMenu (constraint) {
    this.removeAll()
    this.constraintMenu.select('.constraint-id').text(constraint.id)
    this.constraintMenu.select('.delete-constraint')
      .on('click', () => {
        this.app.data.deleteConstraint(constraint.id)
        this.showGlobalMenu()
      })
    this.constraintMenu.select('.params .p1 .param-value').text(constraint.getSourceActivity().name)
    this.constraintMenu.select('.params .p2 .param-value').text(constraint.getTargetActivity().name)
    this.constraintMenu.select('.params .swap-btn button')
      .on('click', () => {
        this.app.data.swapConstraintActivities(constraint.id)
      })

    this.constraintMenu.select('.body').selectAll('*').remove()
    Object.keys(this.app.constraintTypes).forEach(groupName => {
      const div = this.constraintMenu.select('.body')
        .append('div').attr('class', 'row')
      div.append('div').attr('class', 'col-12 constraint-group-name').text(groupName)
      div.selectAll('.constraint-type')
        .data(Object.values(this.app.constraintTypes[groupName]))
        .enter()
        .append('div').attr('class', 'col-12 constraint-type')
        .append('input').attr('type', 'radio').attr('name', 'constraint-type')
        .attr('checked', d => constraint.type.xmlName === d.xmlName ? true : null)
        .property('value', d => d.xmlName)
        .select(function () { return this.parentNode })
        .append('span').text(d => d.toString())
    })
    this.constraintMenu.select('.body').selectAll('input')
      .on('change', d => constraint.setType(d))

    this.constraintMenu.style('display', null)
  }

  updateGlobalMenu () {
    const activities = this.app.data.getActivities()
    this.counterActivities.text((activities.length === 0) ? '' : activities.length)
    this.globalMenu.select('.tab-content #tab-activities').selectAll('*').remove()
    const activitiesTable = this.globalMenu.select('.tab-content #tab-activities').append('table').attr('class', 'table table-sm')
    activitiesTable.append('thead').append('tr')
      .selectAll('th')
      .data(['Id', 'Name'])
      .enter()
      .append('th')
      .attr('scope', 'col')
      .text(d => d)
    activitiesTable.append('tbody')
      .selectAll('tr')
      .data(activities)
      .enter()
      .append('tr')
      .each(function (d) {
        const tr = d3.select(this)
          .on('mouseover', () => d.highlight(true))
          .on('mouseout', () => d.highlight(false))
          .on('click', () => this.app.data.selectElement(d.id))
        tr.append('td').attr('scope', 'row').text(d.id)
        tr.append('td').text(d.name)
      })

    const constraints = this.app.data.getConstraints()
    this.counterConstraints.text((constraints.length === 0) ? '' : constraints.length)
    this.globalMenu.select('.tab-content #tab-constraints').selectAll('*').remove()
    const constraintsTable = this.globalMenu.select('.tab-content #tab-constraints').append('table').attr('class', 'table table-sm')
    constraintsTable.append('thead').append('tr')
      .selectAll('th')
      .data(['Id', 'Type', 'Param1', 'Param2'])
      .enter()
      .append('th')
      .attr('scope', 'col')
      .text(d => d)
    constraintsTable.append('tbody')
      .selectAll('tr')
      .data(constraints)
      .enter()
      .append('tr')
      .each(function (d) {
        const tr = d3.select(this)
          .on('mouseover', () => d.highlight(true))
          .on('mouseout', () => d.highlight(false))
          .on('click', () => this.app.data.selectElement(d.id))
        tr.append('td').attr('scope', 'row').text(d.id)
        tr.append('td').text(d.type.name)
        tr.append('td').text(d.getSourceActivity().name)
        tr.append('td').text(d.getTargetActivity().name)
      })
  }
}
