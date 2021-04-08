class App_ControlBar{
    /*
    */
   constructor(){
        this.div = d3.select("#controlbar");
        this.buttons = {};

        this.buttons.newProject = this.div.select("#btn-new-project")
            .on("click", () => { 
                if (confirm("Do you want to create a new project? \nThe current project will be deleted.")) {
                  app.init(null);
                }
             });
        
        this.buttons.loadFile = this.div.select("#btn-load-file")
            .on("click", () => { app.import.openPopup() });

        this.buttons.saveFile = this.div.select("#btn-save-file")
            .on("click", () => {  app.export.exportXmlFile() });
        
    }
}
