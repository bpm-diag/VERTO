import * as d3 from 'd3'
import constraintTypes from './constraintTypes'
import '../styles/sidepanel.scss'

export default class Sidepanel {
  constructor () {
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
        window.app.data.deleteActivity(activity.id)
        this.showGlobalMenu()
      })
    this.activityMenu.select('.activity-name')
      .property('value', activity.name)
      .on('keyup', function () {
        const name = d3.select(this).property('value')
        activity.setName(name)
      })

    this.activityMenu.select('#absenceCheckbox').on('change', (event) => {
      const selected = d3.select(event.srcElement).property('checked')
      if (selected) this.activityMenu.select('#existenceCheckbox').property('checked', false)
    })
    this.activityMenu.select('#existenceCheckbox').on('change', (event) => {
      const selected = d3.select(event.srcElement).property('checked')
      if (selected) this.activityMenu.select('#absenceCheckbox').property('checked', false)
    })
    this.activityMenu.select('#existenceMinValue').on('keyup', function () {
      const minValue = d3.select(this).property('value')
    })
    this.activityMenu.select('#existenceMaxValue').on('keyup', function () {
      const maxValue = d3.select(this).property('value')
    })

    this.activityMenu.style('display', null)
  }

  showConstraintMenu (constraint) {
    this.removeAll()
    this.constraintMenu.select('.constraint-id').text(constraint.id)
    this.constraintMenu.select('.delete-constraint')
      .on('click', () => {
        window.app.data.deleteConstraint(constraint.id)
        this.showGlobalMenu()
      })
    this.constraintMenu.select('.params .p1 .param-value').text(constraint.getSourceActivity().name)
    this.constraintMenu.select('.params .p2 .param-value').text(constraint.getTargetActivity().name)
    this.constraintMenu.select('.params .swap-btn button')
      .on('click', () => {
        window.app.data.swapConstraintActivities(constraint.id)
      })

    this.constraintMenu.select('.body').selectAll('*').remove()
    Object.keys(constraintTypes).forEach(groupName => {
      const div = this.constraintMenu.select('.body')
        .append('div').attr('class', 'row')
      div.append('div').attr('class', 'col-12 constraint-group-name').text(groupName)
      div.selectAll('.constraint-type')
        .data(Object.values(constraintTypes[groupName]))
        .enter()
        .append('div').attr('class', 'col-12 constraint-type')
        .append('input').attr('type', 'radio').attr('name', 'constraint-type')
        .attr('checked', d => constraint.type.xmlName === d.xmlName ? true : null)
        .property('value', d => d.xmlName)
        .select(function () { return this.parentNode })
        .append('span').text(d => d.toString())
    })
    this.constraintMenu.select('.body').selectAll('input')
      .on('change', (e, d) => constraint.setType(d))

    this.constraintMenu.style('display', null)
  }

  updateGlobalMenu () {
    const activities = window.app.data.getActivities()
    this.counterActivities.text((activities.length === 0) ? '' : activities.length)
    this.globalMenu.select('#activities-tab-pane').selectAll('*').remove()
    const activitiesTable = this.globalMenu.select('#activities-tab-pane').append('table').attr('class', 'table table-sm')
    activitiesTable.append('thead').append('tr')
      .selectAll('th')
      .data(['Activity Id', 'Activity Name', 'Edit'])
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
          // .on('click', () => window.app.data.selectElement(d.id))
        tr.append('td').attr('scope', 'row').text(d.id)
        tr.append('td').text(d.name)
        tr.append('td').attr('class', 'edit').append('i').attr('class', 'fas fa-pen').on('click', () => window.app.data.selectElement(d.id))
      })

    const constraints = window.app.data.getConstraints()
    this.counterConstraints.text((constraints.length === 0) ? '' : constraints.length)
    this.globalMenu.select('#constraints-tab-pane').selectAll('*').remove()
    const constraintsTable = this.globalMenu.select('#constraints-tab-pane').append('table').attr('class', 'table table-sm')
    constraintsTable.append('thead').append('tr')
      .selectAll('th')
      .data(['Id', 'Type', 'Param1', 'Param2', 'Edit'])
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
          // .on('click', () => window.app.data.selectElement(d.id))
        tr.append('td').attr('scope', 'row').text(d.id)
        tr.append('td').text(d.type.name)
        tr.append('td').text(d.getSourceActivity().name)
        tr.append('td').text(d.getTargetActivity().name)
        tr.append('td').attr('class', 'edit').append('i').attr('class', 'fas fa-pen').on('click', () => window.app.data.selectElement(d.id))
      })
  }
}

/*
<table class="table">
<thead>
  <tr>
    <th scope="col">#</th>
    <th scope="col">First</th>
    <th scope="col">Last</th>
    <th scope="col">Handle</th>
  </tr>
</thead>
<tbody>
  <tr>
    <th scope="row">1</th>
    <td>Mark</td>
    <td>Otto</td>
    <td>@mdo</td>
  </tr>
  <tr>
    <th scope="row">2</th>
    <td>Jacob</td>
    <td>Thornton</td>
    <td>@fat</td>
  </tr>
  <tr>
    <th scope="row">3</th>
    <td>Larry</td>
    <td>the Bird</td>
    <td>@twitter</td>
  </tr>
</tbody>
</table>

<table class="table" data-filtering="true">
<thead>
<tr>
  <th data-breakpoints="xs">ID</th>
  <th>First Name</th>
  <th>Last Name</th>
  <th data-breakpoints="xs">Job Title</th>
  <th data-breakpoints="xs sm">Started On</th>
  <th data-breakpoints="xs sm md">Date of Birth</th>
  <th data-type="html" data-breakpoints="xs sm md">Info</th>
</tr>
</thead>
<tbody>
<tr>
  <td>1</td>
  <td>Dennise</td>
  <td>Fuhrman</td>
  <td>High School History Teacher</td>
  <td>November 8th 2011</td>
  <td>July 25th 1960</td>
  <td><a href="#placeholder">Info link</a></td>
</tr>
<tr>
  <td>2</td>
  <td>Elodia</td>
  <td>Weisz</td>
  <td>Wallpaperer Helper</td>
  <td>October 15th 2010</td>
  <td>March 30th 1982</td>
  <td><a href="#placeholder">Info link</a></td>
</tr>
<tr>
  <td>3</td>
  <td>Raeann</td>
  <td>Haner</td>
  <td>Internal Medicine Nurse Practitioner</td>
  <td>November 28th 2013</td>
  <td>February 26th 1966</td>
  <td><a href="#placeholder">Info link</a></td>
</tr>
<tr>
  <td>4</td>
  <td>Junie</td>
  <td>Landa</td>
  <td>Offbearer</td>
  <td>October 31st 2010</td>
  <td>March 29th 1966</td>
  <td><a href="#placeholder">Info link</a></td>
</tr>
<tr>
  <td>5</td>
  <td>Solomon</td>
  <td>Bittinger</td>
  <td>Roller Skater</td>
  <td>December 29th 2011</td>
  <td>September 22nd 1964</td>
  <td><a href="#placeholder">Info link</a></td>
</tr>
<tr>
  <td>6</td>
  <td>Bar</td>
  <td>Lewis</td>
  <td>Clown</td>
  <td>November 12th 2012</td>
  <td>August 4th 1991</td>
  <td><a href="#placeholder">Info link</a></td>
</tr>
<tr>
  <td>7</td>
  <td>Usha</td>
  <td>Leak</td>
  <td>Ships Electronic Warfare Officer</td>
  <td>August 14th 2012</td>
  <td>November 20th 1979</td>
  <td><a href="#placeholder">Info link</a></td>
</tr>
<tr>
  <td>8</td>
  <td>Lorriane</td>
  <td>Cooke</td>
  <td>Technical Services Librarian</td>
  <td>September 21st 2010</td>
  <td>April 7th 1969</td>
  <td><a href="#placeholder">Info link</a></td>
</tr>
</tbody>
</table> */
