class projectUtil{
    // arr to store all projs
    static projectArr = new Map();

    static selectedProjID;

    static selectedTodoID;

    static defaultProjID;

    // items arr (5 priorities maps, 6 for no priotity set, 7 for finished)
    itemsArr = Array.from({length: 7}, () => new Map());

    constructor(name = "untitled", color = "blue", isDefault = 0) {
        this.name = name;
        this.color = color;
        this.isDefault = isDefault;

        // unique id, add to projArr
        this.id = crypto.randomUUID();
        projectUtil.projectArr.set(this.id, this);
    }

    static refreshItems() {
        this.itemsArr.sort((a, b) => {
            return (a.dueDate.getTime() - b.dueDate.getTime());
        });
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

}

export {projectUtil};