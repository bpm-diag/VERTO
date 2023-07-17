/* global Blob */

export default class Export {
  exportToVrtFile () {
    const model = window.app.data.toVERTOModel()
    const str = model.toString()
    const filename = `${model.name()}.vrt`
    this._exportFile(filename, str)
  }

  /*
  exportJsonFile () {
    const str = window.app.data.getJson()
    this.exportFile(`${window.app.data.modelName}.json`, str)
  }

  exportXmlFile () {
    const str = window.app.data.getXML()
    this.exportFile(`${window.app.data.modelName}.xml`, str)
  }
  */

  _exportFile (filename, str) {
    const blob = new Blob([str], { type: 'text/plain' })
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
