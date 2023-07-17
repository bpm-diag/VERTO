import * as d3 from 'd3'

export default class NavBar {
  /*
  */
  constructor () {
    this.div = d3.select('#navbar')
    // this.buttons = {}

    // new project
    this.div.select('#btn-new-project')
      .on('click', () => {
        if (window.confirm('Do you want to create a new project? \nThe current project will be deleted.')) {
          window.app.init(null)
        }
      })

    // open file
    this.div.select('#btn-open').on('click', () => { window.app.import.openPopup() })

    // export to vrt
    this.div.select('#btn-save-vrt').on('click', () => { window.app.export.exportToVrtFile() })

    /*
    this.buttons.loadFile = this.div.select('#btn-load-file')
      .on('click', () => { this.app.import.openPopup() })

    this.buttons.saveJson = this.div.select('#btn-save-json')
      .on('click', () => { this.app.export.exportXmlFile() })

      */
  }
}
