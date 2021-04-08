class Model{
    constructor(){
        this.data = {
            id: null,
            name: null,
            activities: [],
            constraints: []
        }
    }
    id(value){
        if(value == undefined) return this.data.id;
        this.data.id = value;
        return this;
    }
    name(value){
        if(value == undefined) return this.data.name;
        this.data.name = value;
        return this;
    }
    activities(value){
        if(value == undefined) return this.data.activities;
        this.data.activities = value.map(a => new Activity_Model(a));
        return this;
    }
    constraints(value){
        if(value == undefined) return this.data.constraints;
        this.data.constraints = value.map(c => new Constraint_Model(c));
        return this;
    }
    toString(){
        return null;
    }
}
/*
*/
class JSON_Model extends Model{
    constructor(jsonString){
        super();
        if(jsonString != undefined){
            try{
                this.parseString(jsonString);
            } catch(e){
                console.warn(e);
                throw "Not a valid json input file.";
            }
        }
    }
    toString(){
        let json = {
            type: "VERTO",
            version: "1.0",
            modelId: this.data.id,
            modelName: this.data.name,
            activities: this.data.activities.map(a => a.toObject()),
            constraints: this.data.constraints.map(c => c.toObject())
        };
        return JSON.stringify(json);
    }
    parseString(string){
        let json = JSON.parse(string);
        if(json.type != "VERTO") throw "Not a valid input file.";
        if(json.version == undefined) throw "Not a valid input file.";
        if(json.modelName == undefined) throw "Not a valid input file.";
        if(json.activities == undefined || !Array.isArray(json.activities)) throw "Not a valid input file.";
        if(json.constraints == undefined || !Array.isArray(json.constraints)) throw "Not a valid input file.";

        this.data.id = json.modelId;
        this.data.name = json.modelName;
        this.data.activities = json.activities.map(a => new Activity_Model( new String(JSON.stringify(a)) ));
        this.data.constraints = json.constraints.map(c => new Constraint_Model( new String(JSON.stringify(c)) ));
    }
}
/*
*/
class XML_Model extends Model{
    constructor(xmlString){
        super();
        if(xmlString != undefined){
            try{
                this.parseString(xmlString);
            } catch(e){
                console.warn(e);
                throw "Not a valid xml input file.";
            }
        }
    }
    toString(){
        let activities = this.data.activities.map(a => a.toXML().definition).join("\n");
        let constraints = this.data.constraints.map(c => c.toXML().definition).join("\n");
        let activitiesGraphical = this.data.activities.map(a => a.toXML().graphical).join("\n");
        let constraintsGraphical = this.data.constraints.map(c => c.toXML().graphical).join("\n");
        let xml = `
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<model>
    <assignment language="ConDec" name="${this.data.name}" ident="${this.data.id}">
        <activitydefinitions>
            ${activities}
        </activitydefinitions>
        <constraintdefinitions>
            ${constraints}
        </constraintdefinitions>
        <data/>
        <team/>
        <graphical>
            <activities>
                ${activitiesGraphical}
            </activities>
            <constraints>
                ${constraintsGraphical}
            </constraints>
        </graphical>
    </assignment>
</model>
`;
        return xml;
    }
    parseString(string){
        let xml = new DOMParser().parseFromString(string, "text\/xml");
        if(xml.documentElement.nodeName == "parsererror") throw "parser error";
        let data = this.getJXONData(xml);
        console.log(data)
        
        if(data.model === undefined) throw "parser error";
        if(data.model.assignment === undefined) throw "parser error";
        if(data.model.assignment.language != "ConDec") throw "parser error";
        if(data.model.assignment.activitydefinitions === undefined) throw "parser error";
        if(data.model.assignment.constraintdefinitions === undefined) throw "parser error";
        this.data.id = data.model.assignment.ident;
        this.data.name = data.model.assignment.name;
        //activities
        let activities = {};
        if(data.model.assignment.activitydefinitions.activity !== undefined){
            if(!Array.isArray(data.model.assignment.activitydefinitions.activity)){
                data.model.assignment.activitydefinitions.activity = [ JSON.parse(JSON.stringify(data.model.assignment.activitydefinitions.activity)) ];
            }
            data.model.assignment.activitydefinitions.activity.forEach(a => {
                activities[a.id] = {
                    id: a.id,
                    name: a. name
                }
            })
        };
        if(data.model.assignment.graphical !== undefined && data.model.assignment.graphical.activities !== undefined){
            if(data.model.assignment.graphical.activities.cell !== undefined){
                if(!Array.isArray(data.model.assignment.graphical.activities.cell)){
                    data.model.assignment.graphical.activities.cell = [ JSON.parse(JSON.stringify(data.model.assignment.graphical.activities.cell)) ];
                }
                data.model.assignment.graphical.activities.cell.forEach(c => {
                    activities[c.id].x = c.x;
                    activities[c.id].y = c.y;
                    activities[c.id].width = c.width;
                    activities[c.id].height = c.height;
                })
            }
        };
        this.data.activities = d3.values(activities).map(a => {
            let m = new Map();
            d3.entries(a).forEach(e => m.set(e.key, e.value));
            return new Activity_Model( new Map(m) ) ;
        })
        //constraints
        let constraints = {};
        if(data.model.assignment.constraintdefinitions.constraint !== undefined){
            if(!Array.isArray(data.model.assignment.constraintdefinitions.constraint)){
                data.model.assignment.constraintdefinitions.constraint = [ JSON.parse(JSON.stringify(data.model.assignment.constraintdefinitions.constraint)) ];
            }
            data.model.assignment.constraintdefinitions.constraint.forEach(c => {
                if(c.constraintparameters != undefined && c.constraintparameters.parameter != undefined){
                    constraints[c.id] = {
                        id: c.id,
                        xmlName: c.name
                    };
                    if(c.constraintparameters.parameter.length != 2) throw "parser error (constraintparameters.parameter.length != 2)";
                    constraints[c.id].sourceActivityName = c.constraintparameters.parameter[0].branches.branch.name;
                    constraints[c.id].targetActivityName = c.constraintparameters.parameter[1].branches.branch.name;
                    constraints[c.id].sourceActivityId = this.data.activities.filter(a => a.name == constraints[c.id].sourceActivityName)[0].id;
                    constraints[c.id].targetActivityId = this.data.activities.filter(a => a.name == constraints[c.id].targetActivityName)[0].id;
                }
                
            })
        };
        if(data.model.assignment.graphical !== undefined && data.model.assignment.graphical.constraints !== undefined){
            if(data.model.assignment.graphical.constraints.cell !== undefined){
                if(!Array.isArray(data.model.assignment.graphical.constraints.cell)){
                    data.model.assignment.graphical.constraints.cell = [ JSON.parse(JSON.stringify(data.model.assignment.graphical.constraints.cell)) ];
                }
                data.model.assignment.graphical.constraints.cell.forEach(c => {
                    constraints[c.id].x = c.x;
                    constraints[c.id].y = c.y;
                })
            }
        };
        
        this.data.constraints = d3.values(constraints).map(c => {
            let m = new Map();
            d3.entries(c).forEach(e => m.set(e.key, e.value));
            return new Constraint_Model( new Map(m) ) ;
        })
        // 
    }
    getJXONData(oXMLParent) {
        function buildValue(sValue) {
            if (/^\s*$/.test(sValue)) { return null; }
            if (/^(true|false)$/i.test(sValue)) { return sValue.toLowerCase() === "true"; }
            if (isFinite(sValue)) { return parseFloat(sValue); }
            if (isFinite(Date.parse(sValue))) { return new Date(sValue); }
            return sValue;
        }
        var vResult = /* put here the default value for empty nodes! */ null, nLength = 0, sCollectedTxt = "";
        if (oXMLParent.attributes != undefined && oXMLParent.attributes.length > 0) {
            vResult = {};
            for (nLength; nLength < oXMLParent.attributes.length; nLength++) {
                let oItAttr = oXMLParent.attributes.item(nLength);
                vResult[oItAttr.nodeName.toLowerCase()] = buildValue(oItAttr.nodeValue.replace(/^\s+|\s+$/g, ""));
                if(oItAttr.nodeName == "name") vResult[oItAttr.nodeName.toLowerCase()] = oXMLParent.getAttribute("name");
            }
          }
        if (oXMLParent.hasChildNodes()) {
          for (var oItChild, sItKey, sItVal, nChildId = 0; nChildId < oXMLParent.childNodes.length; nChildId++) {
            oItChild = oXMLParent.childNodes.item(nChildId);
            if (oItChild.nodeType === 4) { sCollectedTxt += oItChild.nodeValue; } /* nodeType is "CDATASection" (4) */
            else if (oItChild.nodeType === 3) { sCollectedTxt += oItChild.nodeValue.replace(/^\s+|\s+$/g, ""); } /* nodeType is "Text" (3) */
            else if (oItChild.nodeType === 1 && !oItChild.prefix) { /* nodeType is "Element" (1) */
               if (nLength === 0) { vResult = {}; }
              sItKey = oItChild.nodeName.toLowerCase();
              sItVal = this.getJXONData(oItChild);
              if (vResult.hasOwnProperty(sItKey)) {
                if (vResult[sItKey].constructor !== Array) { vResult[sItKey] = [vResult[sItKey]]; }
                vResult[sItKey].push(sItVal);
              } else { vResult[sItKey] = sItVal; nLength++; }
            }
           }
        }
        if (sCollectedTxt) { nLength > 0 ? vResult.keyValue = buildValue(sCollectedTxt) : vResult = buildValue(sCollectedTxt); }
        /* if (nLength > 0) { Object.freeze(vResult); } */
        return vResult;
      }
    
    
}
/*
*/
class Activity_Model{
    constructor(activity){
        this.id = null;
        this.name = null;
        this.x = null;
        this.y = null;
        this.width = null;
        this.height = null;

        if(activity != undefined){
            if(activity instanceof Activity){
                this.id = activity.id;
                this.name = activity.name;
                this.x = activity._svg.x;
                this.y = activity._svg.y;
                this.width = activity._size.width;
                this.height = activity._size.height;
            }
            else if(activity instanceof String){ //from json parser
                activity = JSON.parse(activity);
                this.id = activity.id;
                this.name = activity.name;
                this.x = activity.graphical.x;
                this.y = activity.graphical.y;
                this.width = activity.graphical.width;
                this.height = activity.graphical.height;
            }
            else if(activity instanceof Map){ // from xml parser
                for(let k of activity.keys()){
                    this[k] = activity.get(k)
                }
            }
            else throw "Not a valid input file."
        }
    }
    toXML(){
        let definition = `
        <activity id="${this.id}" name="${this.name}">
            <authorization/>
            <datamodel/>
        </activity>
        `;
        let graphical = `
            <cell height="${this.height}" id="${this.id}" width="${this.width}" x="${this.x}" y="${this.y}"/>
        `;
        return {
            definition: definition,
            graphical: graphical
        }
    }
    toObject(){
        return JSON.parse(JSON.stringify({
            id: this.id,
            name: this.name,
            graphical: {
                x: this.x,
                y: this.y,
                width: this.width,
                height: this.height
            }
        }));
    }
    toJSON(){
        return JSON.stringify(this.toObject());
    }
}
/*
*/
class Constraint_Model{
    constructor(constraint){
        this.id = null;
        this.xmlName = null;
        this.type = null;
        this.sourceActivityId = null;
        this.targetActivityId = null;
        this.sourceActivityName = null;
        this.targetActivityName = null;
        this.x = null;
        this.y = null;

        if(constraint instanceof Constraint){
            let sourceActivity = constraint.getSourceActivity();
            let targetActivity = constraint.getTargetActivity();
            let iconPosition = constraint.svg.iconPositioner(sourceActivity.getAnchors().center, targetActivity.getAnchors().center);
            this.id = constraint.id;
            this.type = constraint.type;
            this.xmlName = constraint.type.xmlName;
            this.sourceActivityId = sourceActivity.id;
            this.sourceActivityName = sourceActivity.name;
            this.targetActivityId = targetActivity.id;
            this.targetActivityName = targetActivity.name;
            this.x = iconPosition.x;
            this.y = iconPosition.y;
        }
        else if(constraint instanceof String){ //from json parser
            constraint = JSON.parse(constraint);
            this.id = constraint.id;
            this.type = app.getConstraintType(constraint.xmlName);
            this.xmlName = constraint.xmlName; 
            this.sourceActivityId = constraint.sourceActivityId;
            this.targetActivityId = constraint.targetActivityId;
            this.sourceActivityName = constraint.sourceActivityName;
            this.targetActivityName = constraint.targetActivityName;
            this.x = constraint.graphical.x;
            this.y = constraint.graphical.y;
        }
        else if(constraint instanceof Map){ // from xml parser
            this.id = constraint.get("id");
            this.type = app.getConstraintType(constraint.get("xmlName"));
            this.xmlName = constraint.get("xmlName");
            this.sourceActivityName = constraint.get("sourceActivityName");
            this.targetActivityName = constraint.get("targetActivityName");
            this.sourceActivityId = constraint.get("sourceActivityId");
            this.targetActivityId = constraint.get("targetActivityId");
            this.x = constraint.get("x");
            this.y = constraint.get("y");
        }
        else throw "Not a valid input file."
    }
    toXML(){
        let definition = this.type.getXML(
            this.id,
            this.sourceActivityId, 
            this.sourceActivityName, 
            this.targetActivityId, 
            this.targetActivityName
        );
        let graphical = `
            <cell height="1.0" id="${this.id}" width="1.0" x="${this.x}" y="${this.y}"/>
        `;
        return {
            definition: definition,
            graphical: graphical
        }
    }
    toObject(){
        return JSON.parse(JSON.stringify({
            id: this.id,
            xmlName: this.xmlName,
            sourceActivityId: this.sourceActivityId,
            sourceActivityName: this.sourceActivityName,
            targetActivityId: this.targetActivityId,
            targetActivityName: this.targetActivityName,
            graphical: {
                x: this.x,
                y: this.y,
            }
        }));
    }
    toJSON(){
        return JSON.stringify(this.toObject());
    }
}