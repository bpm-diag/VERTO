/*
var $ = window.$;
var d3 = window.d3;
var tippy = window.tippy;
d3.lockUI = window.d3.lockUI;
*/

var app = (new class{
    constructor(){
        $( () => {
            //this.$ = window["$"];
            d3.lockUI.lock();
            this.init();
            d3.lockUI.unlock();
        });
    }
    /*
    */
    init(model){
        this.data = new App_Data();
        this.canvas = new App_Canvas();
        this.controlBar = new App_ControlBar();
        this.sidepanel = new App_Sidepanel();
        this.import = new App_Import();
        this.export = new App_Export();

        this.constraintTypes = {
            /*
            "Existence": {
                "Existence": new ConstraintType_Existence(),
                "Absence": new ConstraintType_Absence(),
            },
            */
            "Choice Relation": {
                "Choice": new ConstraintType_Choice(),
                "ExclusiveChoice": new ConstraintType_ExclusiveChoice(),
            },
            "Relation": {
                "Response": new ConstraintType_Response(),
                "Precedence": new ConstraintType_Precedence(),
                "AlternateResponse": new ConstraintType_AlternateResponse(),
                "AlternatePrecedence": new ConstraintType_AlternatePrecedence(),
                "ChainResponse": new ConstraintType_ChainResponse(),
                "ChainPrecedence": new ConstraintType_ChainPrecedence(),
                "RespondedExistence": new ConstraintType_RespondedExistence(),
            },
            "Mutual Relation": {
                "CoExistence": new ConstraintType_CoExistence(),
                "Succession": new ConstraintType_Succession(),
                "ChainSuccession": new ConstraintType_ChainSuccession(),
                "AlternateSuccession": new ConstraintType_AlternateSuccession(),
            },
            "Negative Relation": {
                "NotCoExistence": new ConstraintType_NotCoExistence(),
                "NotSuccession": new ConstraintType_NotSuccession(),
                "NotChainSuccession": new ConstraintType_NotChainSuccession(),
            }
        };

        if(model === undefined) model = this.data.loadModelFromCache(); 
        if(model !== undefined && model !== null){
            console.log(model);
            model.data.activities.forEach(a => {
                this.data.createActivity(a.id, {x:a.x, y:a.y}).setName(a.name);
            });
            model.data.constraints.forEach(c => {
                let sourceId = (c.sourceActivityId == null || c.sourceActivityId == "") ? this.data.getActivitiesFromName(c.sourceActivityName) : c.sourceActivityId;
                let targetId = (c.targetActivityId == null || c.targetActivityId == "") ? this.data.getActivitiesFromName(c.targetActivityName) : c.targetActivityId;
                let type = this.getConstraintType(c.xmlName);
                this.data.createConstraint(c.id, sourceId, targetId, type);
            });
        }
        /*
        if(true){
            let a1 = app.data.createActivity( {x:200, y:200} ).setName("A");
            let a2 = app.data.createActivity( {x:600, y:400} ).setName("B");
            //let a3 = app.data.createActivity( {x:300, y:500} ).setName("C");
            let c1 = app.data.createConstraint(a1.id, a2.id);
            //let c2 = app.data.createConstraint(a1.id, a3.id);
            //let c3 = app.data.createConstraint(a2.id, a3.id);
            //app.upload.openPopup();

            console.log(app.data.getXML());
        }
        */
    }
    getConstraintType(xmlName){
        let type = undefined;
        d3.values(this.constraintTypes).forEach(g => {
            d3.values(g).forEach(t => {
                if(t.xmlName == xmlName) type = t;
            })
        })
        return type;
    }
}());
