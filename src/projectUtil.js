class projectUtil{
    // arr to store all projs
    static projectArr = new Map();

    static selectedProjID;

    static selectedTodoID;

    static defaultProjID;

    // items arr (5 priorities maps, 6 for no priotity set, 7 for finished)
    itemsArr = Array.from({length: 7}, () => new Map());

    constructor(name = "untitled", color = "blue", isDefault = 0, id = crypto.randomUUID()) {
        this.name = name;
        this.color = color;
        this.isDefault = isDefault;

        // unique id, add to projArr
        this.id = id;
        projectUtil.projectArr.set(this.id, this);
    }

    updateName(newName) {
        this.name = newName;
    }

    static removeProjByID(id) {
        projectUtil.projectArr.delete(id);
        // fall back to default Proj as seleced
        if (id == projectUtil.selectedProjID) {
            projectUtil.selectedProjID = projectUtil.defaultProjID;
        }
    }
    
    markProjAsDefault(){
        projectUtil.defaultProjID = this.id;
    }
    // local storage
    static formatTask(taskObj) {
        return {...taskObj, dueDate: taskObj.dueDate.toISOString()};
    }
    static parseTask(taskObj) {
        return {...taskObj, dueDate: new Date(taskObj.dueDate)};
    }

    toJSON() {
        // const temp = this.itemsArr.map(priMap => [...priMap.entries().map(([id, task]) => [id, projectUtil.formatTask(task)])]);
        const temp = this.itemsArr.map(priMap => Array.from(priMap, ([id, task]) => [id, projectUtil.formatTask(task)]));
        return {...this, itemsArr: temp};
    }
    static fromJSON(proj_KV) {
        const [id, projInfo] = proj_KV;
        const temp = new projectUtil(projInfo.name, projInfo.color, projInfo.isDefault, projInfo.id);
        temp.itemsArr = projInfo.itemsArr.map(mapInfo => new Map(mapInfo.map(([id, task]) => [id, this.parseTask(task)]))); 
    }
    static saveLocal(){
        const payload = {
            projects : [...this.projectArr.entries()],
            selectedProjID: projectUtil.selectedProjID,
            selectedTodoID: projectUtil.selectedTodoID,
            defaultProjID: projectUtil.defaultProjID   
        }
        localStorage.setItem("projClassPrototype", JSON.stringify(payload));
    }

    static loadLocal(){
        let payload = localStorage.getItem("projClassPrototype");
        // no prior data
        if (!payload) return false;
        payload = JSON.parse(payload);
        this.selectedProjID = payload.selectedProjID;
        this.selectedTodoID = payload.selectedTodoID;
        this.defaultProjID = payload.defaultProjID;
        projectUtil.projectArr.clear();
        payload.projects.forEach(kv => this.fromJSON(kv));
        return true;
    }

}

export {projectUtil};