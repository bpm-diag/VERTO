class App_Canvas{
   constructor(){
        this.width = 4096;
        this.height = 2160; //4k resolution


        this.svg = d3.select("#canvas");
        this.svg.selectAll("*").remove();
        this.svg.append("svg:defs")
            .append("marker")
                .attr("id", 'activity-handle-arrow')
                .attr("markerWidth", '8')
                .attr("markerHeight", '8')
                .attr("refX", '0')
                .attr("refY", '2')
                .attr("orient", 'auto')
                .attr("markerUnits", 'strokeWidth')
                .attr("fill", "darkgrey")
            .append("path")
                .attr("d", "M0,0 L0,4 L4,2 z");
        
        this.g = null;
        this.zoom = null;
        this.gConstraints = null;
        this.gActivities = null;
        this.status = {
            creatingConstraint: false
        }
        //this.width = this.svg.node().getBoundingClientRect().width;
        //this.height = this.svg.node().getBoundingClientRect().height;
        this.g = this.svg.append("g").attr("class", "content");
        
        this.gConstraints = this.g.append("g").attr("class", "constraints");
        this.gActivities = this.g.append("g").attr("class", "actvities");

        this.zoom = d3.zoom()
            .scaleExtent([0.1, 2])
            //.translateExtent([[-this.width/2, -this.height/2], [this.width/2, this.height/2]])
            .translateExtent([[0, 0], [this.width, this.height]])
            .on("start", () => {
                this.svg.classed("on-moving", true);
            })
            .on("zoom", () => {
                this.g.attr("transform", d3.event.transform);
                this.overview.updateFocus(
                    this.fromViewportToSvg(0,0),
                    this.fromViewportToSvg(this.svg.node().getBoundingClientRect().width,this.svg.node().getBoundingClientRect().height)
                );
            })
            .on("end", () => {
                this.svg.classed("on-moving", false);
            });
        //var initialTranform = d3.zoomIdentity.translate(-this.width/2, -this.height/2).scale(1);
        //this.g.attr("transform", `translate(${-this.width/2},${-this.height/2}) scale(1)`);
        this.svg.call(this.zoom).on("dblclick.zoom", null);
        

        this.svg.on("click", () => {
            let targetId = d3.select(d3.event.target).attr("id");
            if(targetId != this.svg.attr("id")) return;
            app.data.deselectAll();
        })
        .on("dblclick", () => {
            let targetId = d3.select(d3.event.target).attr("id");
            if(targetId != this.svg.attr("id")) return;
            let position = this.fromViewportToSvg(d3.event.offsetX, d3.event.offsetY)
            app.data.createActivity(null, position, true);
        })
        .on("mouseover", () => {
        })
        .on("mouseout", () => {
            
        })

        tippy(this.svg.node(), {
            placement: "bottom",
            distance: -200,
            arrow: true,
            delay: [500, 0],
            content: "Double click on an empty space <br> to create an activity",
            onShow: () => {
                if(app.data.getActivities().length != 0) return false;
            }
        });
        /* overview */
        this.overview = new App_CanvasOverview(this.width, this.height);
        this.overview.updateFocus(
            this.fromViewportToSvg(0,0),
            this.fromViewportToSvg(this.svg.node().getBoundingClientRect().width,this.svg.node().getBoundingClientRect().height)
        );
    }
    /*
    */
    fromViewportToSvg(x,y){
        let transform = this.g.attr("transform");
        if(transform != null){
            let translate = transform.split(" ")[0]
                .replace("translate(", "")
                .replace(")", "")
                .split(",")
                .map(d => +d);
            let scale = +transform.split(" ")[1]
                .replace("scale(", "")
                .replace(")", "");

            x -= translate[0];
            y -= translate[1];
            x /= scale;
            y /= scale;
            x = Math.floor(x);
            y = Math.floor(y);
        }
        return {x:x, y:y}
    }
}
class App_CanvasOverview{
    constructor(width, height){
        this.width = width;
        this.height = height;
        this.svg = d3.select("#canvas-overview")
            .attr("viewBox", `0 0 ${this.width} ${this.height}`)
            .attr("preserveAspectRatio", "xMidYMid");
        this.svg.selectAll("*").remove();
        this.gConstraints = this.svg.append("g").attr("class", "constraints");
        this.gActivities = this.svg.append("g").attr("class", "actvities");
        /*
        this.canvas = this.container.append("svg")
            .attr("x", 3)
            .attr("y", 3)
            .attr("width", this.width -3)
            .attr("height", this.height -3)
            .attr("viewBox", `0 0 ${this.width} ${this.height}`)
            .attr("preserveAspectRatio", "xMidYMid");
        */
        this.focus = this.svg.append("rect")
            .attr("class", "focus")
            .attr("x", 0)
            .attr("y", 0)
            //.attr("width", 100)
            //.attr("height", 100)
        
    }
    updateFocus(top, bottom){
        this.focus
            .attr("x", top.x)
            .attr("y", top.y)
            .attr("width", bottom.x - top.x)
            .attr("height", bottom.y - top.y)
    }
}


