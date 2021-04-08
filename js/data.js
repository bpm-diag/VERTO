class App_Data{
    constructor(){
        this.modelId = this.uuid();
        this.modelName = "verto";
        this.activities = {};
        this.constraints = {};
        this.selectedElement = null;
        this.cacheKey = "vertoDesignerModel";

        d3.select(document).on("keyup.app_data", () => {
            let e = d3.event;
            if(e.code == "Delete" || e.code == "MetaRight" || e.code == "MetaLeft"){
                //delete current selected element
                if(this.selectedElement == null) return;
                let element = this.getElement(this.selectedElement);
                if(element instanceof Activity) this.deleteActivity(element.id)
                else if(element instanceof Constraint) this.deleteConstraint(element.id);
                app.sidepanel.showGlobalMenu();
            }
            //console.log(event)
        })
    }
    uuid(){
        let dt = Date.now();
        let uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            let r = (dt + Math.random()*16)%16 | 0;
            dt = Math.floor(dt/16);
            return (c=="x" ? r :(r&0x3|0x8)).toString(16);
        });
        return uuid;
    }
    generateID(){
        let uuid = 0;
        while(true){
            uuid++;
            let found = false;
            for(let key in this.activities){
                if(this.activities[key].id == uuid){
                    found = true;
                    break;
                }
            }
            if(found) continue;
            for(let key in this.constraints){
                if(this.constraints[key].id == uuid){
                    found = true;
                    break;
                }
            }
            if(!found) return uuid;
        }
    }
    /*
    ACTIVITIES
    */
    getActivities(){
        let list = d3.values(this.activities).sort((a,b) => a.id - b.id);
        return (list == null) ? [] : list;
    }
    getActivity(activityId){
        return this.activities[activityId];
    }
    getActivitiesFromName(name){
        let list = d3.values(this.activities).filter(a => a.name == name);
        if(list.length == 0) return undefined;
        return list[0];
    }
    createActivity(id, position, select=false){
        if(id == undefined) id = this.generateID();
        this.activities[id] = new Activity(id, position);
        if(select) this.selectElement(id);
        this.saveModelToCache();
        app.sidepanel.updateGlobalMenu();
        return this.activities[id];
    }
    deleteActivity(activityId){
        let a = this.activities[activityId];
        if(a.id == this.selectedElement) this.selectedElement = null;
        this.getConstraintsOfActivity(activityId).forEach(c => this.deleteConstraint(c.id));
        a.delete();
        delete this.activities[activityId];
        this.saveModelToCache();
        app.sidepanel.updateGlobalMenu();
    }
    /*
    CONSTRAINTS
    */
    getConstraints(){
        let list = d3.values(this.constraints).sort((a,b) => a.type.name.localeCompare(b.type.name));
        return (list == null) ? [] : list;
    }
    getConstraint(constraintId){
        return this.constraints[constraintId];
    }
    getConstraintsOfActivity(activityId){
        return d3.values(this.constraints)
            .filter( c => { return c.sourceId == activityId || c.targetId == activityId });
    }
    createConstraint(id, sourceId, targetId, type, select=false){
        if(id == undefined) id = this.generateID();
        this.constraints[id] = new Constraint(id, sourceId, targetId, type);
        this.getActivity(sourceId).addConstraint(id);
        this.getActivity(targetId).addConstraint(id);
        if(select) this.selectElement(id);
        this.saveModelToCache();
        app.sidepanel.updateGlobalMenu();
        return this.constraints[id];
    }
    deleteConstraint(constraintId){
        let c = this.getConstraint(constraintId);
        if(c.id == this.selectedElement) this.selectedElement = null;
        this.activities[c.sourceId].removeConstraint(c.id);
        this.activities[c.targetId].removeConstraint(c.id);
        c.delete();
        delete this.constraints[constraintId];
        this.saveModelToCache();
        app.sidepanel.updateGlobalMenu();
    }
    swapConstraintActivities(constraintId){
        let c = this.getConstraint(constraintId);
        let newSourceId =  c.targetId;
        let newTargetId = c.sourceId;
        let type = c.type;
        //
        if(c.id == this.selectedElement) this.selectedElement = null;
        this.activities[c.sourceId].removeConstraint(c.id);
        this.activities[c.targetId].removeConstraint(c.id);
        c.delete();
        delete this.constraints[constraintId];
        //
        this.createConstraint(constraintId, newSourceId, newTargetId, type, true);
    }
    /*
    * SELECTION
    */
    getElement(elementId){
        let activity = this.getActivity(elementId);
        if(activity != undefined) return activity;
        let constraint = this.getConstraint(elementId);
        return constraint;
    }
    selectElement(elementId){
        if(this.selectedElement != null) this.getElement(this.selectedElement).setSelected(false);
        this.selectedElement = elementId;
        let element = this.getElement(elementId).setSelected(true);
        if(element instanceof Activity) app.sidepanel.showActivityMenu(element);
        if(element instanceof Constraint) app.sidepanel.showConstraintMenu(element);
        return this;
    }
    deselectAll(){
        if(this.selectedElement != null) this.getElement(this.selectedElement).setSelected(false);
        this.selectedElement = null;
        app.sidepanel.showGlobalMenu();
        return this;
    }
    deleteCurrentSelectedElement(){

    }
    /*
    MODEL
    */
    getXML(){
        let id = this.modelId;
        let name = this.modelName;
        let activities = this.getActivities();
        let constraints = this.getConstraints();
        let model = new XML_Model().id(id).name(name).activities(activities).constraints(constraints);
        return model.toString();
    }
    getJson(){
        let id = this.modelId;
        let name = this.modelName;
        let activities = this.getActivities();
        let constraints = this.getConstraints();
        let model = new JSON_Model().id(id).name(name).activities(activities).constraints(constraints);
        return model.toString();
    }
    loadModelFromCache(){
        let model = null;
        let str = window.localStorage.getItem(this.cacheKey);
        if(str == null) return null;
        try{
            model = new JSON_Model(str);
        } catch(exception){
            console.warn(exception);
            this.clearCache();
        }
        return model;
    }
    saveModelToCache(){
        let str = this.getJson();
        window.localStorage.setItem(this.cacheKey, str);
    }
    clearCache(){
        window.localStorage.removeItem(this.cacheKey);
    }
}