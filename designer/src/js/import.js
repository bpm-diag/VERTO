import * as d3 from 'd3'
import * as $ from 'jquery'
import { JSONModel, XMLModel } from './model'
import lockUI from './lockUI'
import '../styles/import.scss'

/* global alert, FileReader */

export default class Import {
  constructor () {
    this.div = d3.select('#import-panel')
    this.form = this.div.select('form').attr('action', this.formUrl)
    this.container = this.div.select('#import-container')

    this.div.on('click', () => this.closePopup())
    this.container.on('click', (event) => event.stopPropagation())

    $(this.form.node()).on('drag dragstart dragend dragover dragenter dragleave drop', (e) => {
      e.preventDefault()
      e.stopPropagation()
    })
      .on('dragover dragenter', () => {
        this.container.classed('is-dragover', true)
      })
      .on('dragleave dragend drop', () => {
        this.container.classed('is-dragover', false)
      })
      .on('drop', (e) => {
        $(this.form.node()).find('input[type="file"]').prop('files', e.originalEvent.dataTransfer.files)
        this.readFile()
      })

    this.form.select('input').on('change', () => this.readFile())
  }

  /*
  */
  openPopup () {
    this.div
      .style('opacity', 0)
      .style('display', null)
      .transition()
      .style('opacity', 1)
  }

  closePopup () {
    this.div
      .style('opacity', 1)
      .transition()
      .style('opacity', 0)
      .style('display', 'none')
  }

  readFile () {
    lockUI.lock()
    this.closePopup()
    const file = new FormData($(this.form.node()).get(0)).get('file')
    const reader = new FileReader()
    reader.onload = ((f) => {
      return (e) => {
        const fileName = f.name
        const fileContent = e.target.result
        let model = null
        try {
          if (fileName.endsWith('.json')) model = new JSONModel(fileContent)
          if (fileName.endsWith('.xml')) model = new XMLModel(fileContent)
        } catch (exception) {
          model = null
          console.log(exception)
        }
        lockUI.unlock()
        if (model == null) alert('Not a valid input file.')
        else window.app.init(model)
      }
    })(file)
    reader.readAsText(file)
  }
}
