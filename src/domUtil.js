import { projectUtil } from "./projectUtil";
import { addHours, addMinutes, addYears, format, parseISO } from "date-fns";
import plusIcon from "./asset/plus-icon.svg";
import deleteIcon from "./asset/delete-icon.svg";
import { createTodoItem } from "./todoUtil";

// iife create domUtil module
export const domUtil = (() => {
    function projRefresher(){
        // clean old projs 
        const projCont = document.querySelector(".projCont");
        const projDomArr = [...projCont.children];
        projDomArr.forEach(obj => obj.remove());

        // append all projs from arr
        projectUtil.projectArr.forEach(projObj => {
            const temp = document.createElement("div");
            temp.id = `-${projObj.id}`;
            temp.className = "projDIV";
            temp.setAttribute("style", `--color: var(--${projObj.color})`);
            temp.textContent = projObj.name;
            // deleteIcon only available for none default project
            if (!projObj.isDefault) {
                const deleteIcon = document.createElement("img");
                deleteIcon.className = "deleteIcon";
                deleteIcon.src = deleteIcon;
                deleteIcon.alt = "Delete project";
                deleteIcon.style.display = "none";
                deleteIcon.addEventListener("click", () => {
                    // personalize & open deleteDialog
                    const deleteDialog = document.querySelector(".deleteDialog");
                    deleteDialog.querySelector(".projName").textContent = projObj.name;
                    deleteDialog.querySelector(".itemsCount").textContent = projObj.itemsArr.length;
                    // wipes prev confirm btn event Listener
                    const confirmBtn = deleteDialog.querySelector(".confirm");
                    const tempClone = confirmBtn.cloneNode(true);
                    confirmBtn.replaceWith(tempClone);
                    confirmBtn.addEventListener("click", () => {
                        deleteDialog.close(projObj.id);
                    });
                    // open deleteDialog
                    deleteDialog.showModal();
                });
                temp.appendChild(deleteIcon);
                temp.addEventListener("mouseenter", () => {
                    deleteIcon.style.display = "";
                });
                temp.addEventListener("mouseleave", () => {
                    deleteIcon.style.display = "none";
                });
            }

            // also have event that when clicked, render the todolist in the main panel
            temp.addEventListener("click", () => {
                // ignore action for multi click
                if (temp.hasAttribute("selected")) {
                    return;
                }
                // clear existing attribute
                [...projCont.children].forEach(obj => obj.removeAttribute("selected"));
                temp.setAttribute("selected", "");
                projectUtil.selectedProjID = projObj.id;
                todoLstRefresher();
            });
            projCont.appendChild(temp);
        });

        // click the last selected(or default proj last selected just got deleted)
        const id = projectUtil.selectedProjID;
        projCont.querySelector(`-${id}`).click();
    }
    // need to refine logic of building dynamic todoList interface / time logic
    function todoLstRefresher(){
        // clean old todoList data
        const tdWin = document.querySelector(".tdWin");
        tdWin.replaceChildren();

        const currProj = projectUtil.projectArr.get(projectUtil.selectedProjID);

        const todoArr = currProj.itemsArr;

        // if empty insert some para.
        if (todoArr.every(map => map.size == 0)) {
            const emptyHint = document.createElement("div");
            emptyHint.className = "emptyHint";
            emptyHint.textContent = "Congrats! No tasks left!";
            tdWin.appendChild(emptyHint);
        }
        // >= 1 task exists, create priority containers for them
        else{
            for (let i = 0; i < 6; i++) {
                // skip empty cont
                if (todoArr[i].length == 0) continue;
                // priority container only for 0 - 4
                const tempCont = document.createElement("div");
                tempCont.className = "priCont";
                // set color theme var
                tempCont.setAttribute("style", `--theme-color-light: var(--p${i+1}-col-light); --content: "Priority: ${i+1}"; --theme-color: var(--p${i+1}-col)`);
                // turn into arr then sort based on DateObj
                const sortedTasks = Array.from(todoArr[i], ([k, v]) => v).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
                sortedTasks.forEach(todoObj => {
                    const title = document.createElement("p");
                    title.textContent = todoObj.description;
                    const statusCont = document.createElement("div");
                    const statusIcon = document.createElement("img");
                    const statusDes = document.createElement("div");
                });

            }

        }

    }

    function domInit(){
        // create a default project
        const defaultProj = new projectUtil("Default Project", undefined, 1);
        defaultProj.markProjAsDefault();

        // dialogs for projBtn and todoBtn and deleteBtn

        // projBtn
        const projDialog = document.createElement("dialog");
        projDialog.className = "projDialog";

        const projForm = document.createElement("form");
        projForm.className = "projForm";
        projForm.method = "dialog";

        const para = document.createElement("p");
        para.textContent = "Add project";

        const input1 = document.createElement("input");
        input1.id = "name";
        input1.type = "text";
        input1.name = "name";
        input1.required = true;
        const label1 = document.createElement("label");
        label1.textContent = "Name";
        label1.htmlFor = "name";

        const para1 = document.createElement("p");
        para1.textContent = "Color";
        para1.className = "color";

        const colorCont = document.createElement("div");        
        colorCont.className = "colorCont";
        const colorArr = ["blue", "green", "yellow", "orange", "red"];
        colorArr.forEach(color => {
            const tempLabel = document.createElement("label");
            tempLabel.className = "colorLabel";
            tempLabel.setAttribute("style", `--color-fill: var(--${color})`);

            const tempInput = document.createElement("input");
            tempInput.className = "colorRadio";
            tempInput.setAttribute("style", `--color-fill: var(--${color})`);
            tempInput.type = "radio";
            tempInput.name = "color";
            tempInput.value = color;
            if (color == "blue") {
                tempInput.checked = true; 
            }

            tempLabel.append(tempInput, document.createTextNode(`${color}`));
            colorCont.appendChild(tempLabel);
        });

        projForm.append(para, label1, input1, para1, colorCont);

        const btnCont = document.createElement("div");
        btnCont.className = "btnCont";
        const cancel = document.createElement("button");
        cancel.type = "submit";
        cancel.textContent = "Cancel";
        const confirm = document.createElement("button");
        confirm.value = "confirm";
        confirm.type = "submit";
        confirm.textContent = "Create!";
        btnCont.append(cancel, confirm);
        projForm.appendChild(btnCont);
        projDialog.appendChild(projForm);
        // retrieve proj input & update backend / frontend
        projDialog.addEventListener("close", () => {
            if (!projDialog.returnValue) return;
            const formContent = Object.fromEntries(new FormData(projForm));  
            const tempProj = new projectUtil(formContent.name, formContent.color);
            domUtil.projRefresher();
        });

        // todoBtn
        const toDoDialog = document.createElement("dialog");
        toDoDialog.className = "toDoDialog";
        const toDoForm = document.createElement("form");
        toDoForm.className = "toDoForm";
        toDoForm.method = "dialog";
        const headline = document.createElement("p");
        headline.textContent = "Add to-do";
        const titleL = document.createElement("label");
        titleL.textContent = "Title";
        titleL.htmlFor = "titleI";
        const titleI = document.createElement("input");
        titleI.id = "titleI";
        titleI.name = "title";
        titleI.type = "text";
        titleI.required = true;

        const desL = document.createElement("label");
        desL.htmlFor = "desI";
        const desI = document.createElement("input");
        desI.id = "desI";
        desI.name = "description";
        desI.type = "text";
        desI.required = true;

        const dueL = document.createElement("label");
        dueL.htmlFor = "dueI";
        dueL.textContent = "Deadline";
        const dueI = document.createElement("input");
        dueI.id = "dueI";
        dueI.name = "due";
        dueI.type = "datetime-local";
        // set min date to be current time
        dueI.addEventListener("focus", () => {
            dueI.min = format(addMinutes(new Date(), 1), "yyyy-MM-dd'T'HH:mm");
            dueI.max = format(addYears(new Date(), 100), "yyyy-MM-dd'T'HH:mm");
        });
        dueI.required = true;

        const priL = document.createElement("label");
        priL.htmlFor = "priI";
        priL.textContent = "Priority (0 for no priority)";
        const priI = document.createElement("input");
        priI.id = "priI";
        priI.name = "priority";
        priI.type = "number";
        priI.min = "0";
        priI.max = "5";
        priI.defaultValue = "0";
        priI.required = true;
        const btnWrap = document.createElement("div");
        btnWrap.className = "btnCont";
        const noBtn = document.createElement("button");
        noBtn.textContent = "cancel";
        noBtn.type = "submit";
        const yesBtn = document.createElement("button");
        yesBtn.value = "submit";
        yesBtn.type = "submit";
        yesBtn.textContent = "confirm";
        btnWrap.append(noBtn, yesBtn);
        toDoForm.append(headline, titleL, titleI, desL, desI, dueL, dueI, priL, priI, btnWrap);
        toDoDialog.appendChild(toDoForm);

        // deleteBtn
        const deletedialog = document.createElement("dialog");
        deletedialog.className = "deleteDialog";

        const title = document.createElement("div");
        title.className = "title";
        title.textContent = "Do you really want to delete ";
        const projName = document.createElement("span");
        projName.className = "projName";
        title.appendChild(projName);
        title.append(" ?");

        const disclaimer = document.createElement("div"); 
        disclaimer.className = "disclaimer";
        disclaimer.textContent = "Warning: Deleting this project will permanently remove all associated to-do items. Current to-do counts: ";
        const itemsCount = document.createElement("span");
        itemsCount.className = "itemsCount";
        disclaimer.appendChild(itemsCount);

        const cancelBtn = document.createElement("button");
        cancelBtn.className = "cancel";
        cancelBtn.addEventListener("click", () => {
            deletedialog.close("");
        });
        const confirmBtn = document.createElement("button");
        confirmBtn.className = "confirm";

        deletedialog.addEventListener("close", () => {
            const projID = +deletedialog.returnValue;
            
            // if confirm Btn is clicked
            if (projID) {
                // delete current project in the backend
                projectUtil.removeProjByID(projID);
                // call projRefresher()
                projRefresher();
            }
        });
        deletedialog.append(title, disclaimer, cancelBtn, confirmBtn);



        // sidebar
        const sideBar = document.createElement("div");
        sideBar.className = "sideBar";

        const projContainer = document.createElement("div");
        projContainer.className = "projCont";

        const projBtn = document.createElement("div");
        projBtn.className = "projBtn";
        const plusIcon = document.createElement("img");
        plusIcon.src = plusIcon;
        plusIcon.alt = "Add a new project";
        plusIcon.addEventListener("click", () => {
            projForm.reset();
            projDialog.showModal();
        });

        projBtn.appendChild(plusIcon);

        sideBar.append(projContainer, projBtn);
        

        // main
        const mainPanel = document.createElement("div");
        mainPanel.className = "mainPanel";

        const todoWindow = document.createElement("div");
        todoWindow.className = "tdWin";

        const tdBtn = document.createElement("div");
        tdBtn.className = "tdBtn";
        const plusIcon1 = document.createElement("img");
        plusIcon1.src = plusIcon;
        plusIcon1.alt = "Add a new Todo";
        const addText = document.createElement("p");
        addText.className = "addText";
        addText.textContent = "Add a new task";
        tdBtn.appendChild(plusIcon1);
        tdBtn.addEventListener("click", () => {
            toDoForm.reset();
            toDoDialog.showModal();
        });

        toDoDialog.addEventListener("close", () => {
            if (!toDoDialog.returnValue) return;

            const formContent = Object.fromEntries(new FormData(toDoForm));
            const currProj = projectUtil.projectArr.get(projectUtil.selectedProjID);
            const tempTodo = createTodoItem(formContent.title, formContent.description, parseISO(formContent.due), formContent.priority);
            const pos = (tempTodo.priority == 0) ? 5 : (tempTodo.priority - 1);
            currProj.itemsArr[pos].set(tempTodo.uid, tempTodo);
            projectUtil.todoLstRefresher();
        });
        
        mainPanel.append(todoWindow, tdBtn);


        
        document.body.append(sideBar, mainPanel, projDialog, toDoDialog, deletedialog);

    };

})();