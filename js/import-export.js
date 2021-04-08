
/*
*
*/
class App_Import{
    constructor(){
        this.div = d3.select("#import-panel");
        this.form = this.div.select("form").attr("action", this.formUrl);
        this.container = this.div.select("#import-container");

        this.div.on("click", () => this.closePopup());
        this.container.on("click", () => d3.event.stopPropagation() );

        $(this.form.node()).on("drag dragstart dragend dragover dragenter dragleave drop", (e) => {
            e.preventDefault();
            e.stopPropagation();
        })
        .on("dragover dragenter", () => {
            this.container.classed("is-dragover", true);
        })
        .on("dragleave dragend drop", () => {
            this.container.classed("is-dragover", false);
        })
        .on("drop", (e) => {
            $(this.form.node()).find('input[type="file"]').prop("files", e.originalEvent.dataTransfer.files);
            this.readFile();
        });

        this.form.select("input").on("change", () => this.readFile());
    }
    /*
    */
    openPopup(){
        this.div
            .style("opacity", 0)
            .style("display", null)
            .transition()
            .style("opacity", 1);
    }
    closePopup(){
        this.div
            .style("opacity", 1)
            .transition()
            .style("opacity", 0)
            .style("display", "none");
    }
    readFile(){
        d3.lockUI.lock();
        this.closePopup();
        let file = new FormData($(this.form.node()).get(0)).get("file");
        var reader = new FileReader();
        reader.onload = ( (f) => {
            return (e) => {
                let fileName = f.name;
                let fileContent = e.target.result;
                let model = null;
                try{
                    if(fileName.endsWith(".json")) model = new JSON_Model(fileContent);
                    if(fileName.endsWith(".xml")) model = new XML_Model(fileContent);
                } catch(exception){
                    model = null;
                    console.log(exception);
                }
                d3.lockUI.unlock();
                if(model == null) alert("Not a valid input file.")
                else app.init(model);
            };
          })(file);
        reader.readAsText(file);
    }
}
/*
*
*/
class App_Export{
    constructor(){  }
    /*
    */
    exportJsonFile(){
        let str = app.data.getJson();
        this.exportFile(`${app.data.modelName}.json`, str);
    }
    exportXmlFile(){
        let str = app.data.getXML();
        this.exportFile(`${app.data.modelName}.xml`, str);
    }
    exportFile(filename, str){
        let blob = new Blob([str], { type: "text/plain" });
        let downloadLink = document.createElement('a');
        downloadLink.download = filename;
        downloadLink.innerHTML = 'Download File';
        downloadLink.href = window.URL.createObjectURL(blob);
        downloadLink.onclick = (event) => document.body.removeChild(event.target);
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);
        downloadLink.click();
    }
}
