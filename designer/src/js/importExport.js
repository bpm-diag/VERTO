/* eslint-disable camelcase */
import * as d3 from 'd3'
import * as $ from 'jquery'
import { JSON_Model, XML_Model } from './model'
import lockUI from './lockUI'
import '../css/importExport.scss'

export class ImportUtils {
  constructor (app) {
    this.app = app
    this.div = d3.select('#import-panel')
    this.form = this.div.select('form').attr('action', this.formUrl)
    this.container = this.div.select('#import-container')

    this.div.on('click', () => this.closePopup())
    this.container.on('click', () => d3.event.stopPropagation())

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
    const file = new window.FormData($(this.form.node()).get(0)).get('file')
    var reader = new window.FileReader()
    reader.onload = ((f) => {
      return (e) => {
        const fileName = f.name
        const fileContent = e.target.result
        let model = null
        try {
          if (fileName.endsWith('.json')) model = new JSON_Model(fileContent)
          if (fileName.endsWith('.xml')) model = new XML_Model(fileContent)
        } catch (exception) {
          model = null
          console.log(exception)
        }
        lockUI.unlock()
        if (model == null) window.alert('Not a valid input file.')
        else this.app.init(model)
      }
    })(file)
    reader.readAsText(file)
  }
}
/*
*
*/
export class ExportUtils {
  constructor (app) {
    this.app = app
  }

  /*
    */
  exportJsonFile () {
    const str = this.app.data.getJson()
    this.exportFile(`${this.app.data.modelName}.json`, str)
  }

  exportXmlFile () {
    const str = this.app.data.getXML()
    this.exportFile(`${this.app.data.modelName}.xml`, str)
  }

  exportFile (filename, str) {
    const blob = new window.Blob([str], { type: 'text/plain' })
    const downloadLink = document.createElement('a')
    downloadLink.download = filename
    downloadLink.innerHTML = 'Download File'
    downloadLink.href = window.URL.createObjectURL(blob)
    downloadLink.onclick = (event) => document.body.removeChild(event.target)
    downloadLink.style.display = 'none'
    document.body.appendChild(downloadLink)
    downloadLink.click()
  }
}
