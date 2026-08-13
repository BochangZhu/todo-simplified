import { projectUtil } from "./projectUtil";
import { addHours, addMinutes, addYears, format, formatRelative, isThisWeek, isToday, isYesterday, parseISO } from "date-fns";

import plusIcon from "./asset/plus-icon.svg";
import deleteIcon from "./asset/delete-icon.svg";
import completeIcon from "./asset/complete-icon.svg";
import goodStatus from "./asset/good-status.svg";
import warningStatus from "./asset/attention-status.svg";
import settingIcon from "./asset/setting-icon.svg";
import desIcon from "./asset/des-icon.svg";

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
            for (let i = 0; i < 7; i++) {
                // skip empty cont
                if (todoArr[i].length == 0) continue;
                // priority container only for 0 - 4
                const tempCont = document.createElement("div");
                tempCont.className = "priCont";
                // set color theme var
                if (i == 6) {
                    tempCont.setAttribute("style", `--theme-color-light: var(--p${i+1}-col-light); --content: "Completed Tasks, we still remember you.."; --theme-color: var(--p${i+1}-col)`);
                }
                else if (i == 5) {
                    tempCont.setAttribute("style", `--theme-color-light: var(--p${i+1}-col-light); --content: ""; --theme-color: var(--p${i+1}-col)`);
                }
                else {
                    tempCont.setAttribute("style", `--theme-color-light: var(--p${i+1}-col-light); --content: "Priority: ${i+1}"; --theme-color: var(--p${i+1}-col)`);
                }
                // turn into arr then sort based on DateObj
                const sortedTasks = Array.from(todoArr[i], ([k, v]) => v).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
                // render todoObjs to current priCont
                sortedTasks.forEach(todoObj => {
                    const todoDIV = document.createElement("div");
                    todoDIV.className = "todoDIV";
                    todoDIV.id = todoObj.id;

                    const doneBtn = document.createElement("img");
                    doneBtn.src = completeIcon;
                    doneBtn.alt = "Mark as complete";
                    doneBtn.className = "doneBtn";
                    doneBtn.addEventListener("click", () => {
                        const id = todoObj.uid;
                        const selectedProj = projectUtil.projectArr.get(projectUtil.selectedProjID);
                        const pos = (todoObj.priority == 0) ? 5 : (todoObj.priority - 1);
                        todoObj.finishTask();
                        todoDIV.classList.toggle("done");
                        // mark it as done
                        if (todoObj.done) {
                            // move to last map in items arr
                            selectedProj.itemsArr[6].set(id, todoObj);
                            selectedProj.itemsArr[pos].delete(id);
                        }
                        // revive the task from last map
                        else {
                            selectedProj.itemsArr[pos].set(id, todoObj);
                            selectedProj.itemsArr[6].delete(id);
                        }
                        domUtil.todoLstRefresher();
                    });

                    const title = document.createElement("p");
                    title.textContent = todoObj.title;
                    title.className = "title";

                    const statusIcon = document.createElement("img");
                    statusIcon.className = "statusIcon";
                    const statusDes = document.createElement("div");
                    statusDes.className = "statusDes";
                    // show different Icon based on now - deadline
                    const dueDate = todoObj.dueDate;
                    const now = new Date();
                    const hrDiff = (dueDate.getTime() - now.getTime()) / 3600000;
                    // format statusIcon
                    if (hrDiff <= 0) {
                        statusIcon.src = warningStatus;
                        statusIcon.alt = "Deadline has passed..";
                        statusIcon.setAttribute("status", "bad");
                        statusDes.setAttribute("status", "bad");
                        
                    }
                    else if (hrDiff <= 4) {
                        statusIcon.src = goodStatus;
                        statusIcon.alt = "LOCK IN";
                        statusIcon.setAttribute("status", "mid");
                        statusDes.setAttribute("status", "mid");
                    }
                    else {
                        statusIcon.src = goodStatus;
                        statusIcon.alt = "Take your time";
                        statusIcon.setAttribute("status", "good");
                        statusDes.setAttribute("status", "good");
                    }

                    // customize dueDate display
                    // case for monday - sunday
                    if (isThisWeek(dueDate, {weekStartsOn: 1}) && !isToday(dueDate) && !isYesterday(dueDate)) {
                        statusDes.textContent = format(dueDate, "eeee h:mm a");
                    }
                    // keyword case
                    else {
                        const customFormat = {
                            lastWeek: "'Last Week' h:mm a", // AM/PM
                            yesterday: "'Yesterday' h:mm a",
                            today: "'Today' h:mm a",
                            tomorrow: "'Tomorrow' h:mm a",
                            nextWeek: "'Next week' h:mm a",
                            other: "yyyy-MM-dd h:mm a"
                        };

                        const opt = {
                            weekStartsOn : 1,
                            locale: {
                                formatRelative: (token) => customFormat[token]
                            }
                        };
                        statusDes.textContent = formatRelative(dueDate, now, opt);
                    }
                    const expandIcon = document.createElement("img");
                    expandIcon.className = "expandIcon";
                    expandIcon.src = expandIcon;
                    expandIcon.addEventListener("click", () => {
                        // set currTodoID to be this task
                        projectUtil.selectedTodoID = todoObj.id;
                        // pre-fill inputs of the edit Dialog
                        const editForm = document.querySelector(".editForm");

                        editForm.querySelector(".titleInput").value = todoObj.title;

                        editForm.querySelector(".desInput").value = todoObj.description;

                        const dueInput = editForm.querySelector("#dueInput");
                        const due = todoObj.dueDate;
                        dueInput.value = format(due, "yyyy-MM-dd'T'HH:mm");
                        dueInput.min = dueInput.value;
                        dueInput.max = format(addYears(due, 100), "yyyy-MM-dd'T'HH:mm");
                        
                        editForm.querySelector("#priInput").value = todoObj.priority;

                        const move = editForm.querySelector("#moveToProj");
                        move.replaceChildren();
                        projectUtil.projectArr.forEach(projObj => {
                            const name = projObj.name;
                            const id = projObj.id;
                            const opt = document.createElement("option");
                            opt.value = id;
                            opt.textContent = name;
                            if (id == projectUtil.selectedProjID) {
                                opt.selected = true;
                                opt.textContent += " (current)";
                            }
                        });

                        document.querySelector(".editDialog").showModal();
                    });

                    todoDIV.append(doneBtn, title, statusIcon, statusDes, expandIcon);
                    tempCont.appendChild(todoDIV);
                });
                tdWin.appendChild(tempCont);
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

        // todoEditDialog
        const editDialog = document.createElement("dialog");
        editDialog.className = "editDialog";
        const editForm = document.createElement("form");
        editForm.className = "editForm";
        // Basic section
        const basicCont = document.createElement("div");
        basicCont.className = "iconCont";
        const settingIcon = document.createElement("img");
        settingIcon.src = settingIcon;
        settingIcon.className = "settingIcon";
        basicCont.appendChild(settingIcon, document.createTextNode("Basic"));

        const titleInput = document.createElement("input");
        titleInput.type = "text";
        titleInput.className = "titleInput";
        titleInput.name = "title";
        const desInput = document.createElement("input");
        desInput.type = "text";
        titleInput.className = "desInput";
        desInput.name = "description";
        // Setting section
        const settingCont = document.createElement("div");
        const settingIconD = settingIcon.cloneNode(true);
        settingCont.append(settingIconD, document.createTextNode("Setting"));

        const dueLabel = document.createElement("label");
        dueLabel.htmlFor = "dueInput";
        dueLabel.textContent = "Deadline";
        const dueInput = document.createElement("input");
        dueInput.id = "dueInput";
        dueInput.type = "datetime-local";
        dueInput.name = "due";

        const priLabel = document.createElement("label");
        priLabel.htmlFor = "priInput";
        priLabel.textContent = "Priority";
        const priInput = document.createElement("input");
        priInput.id = "priInput";
        priInput.name = "priority";
        priInput.type = "number";
        priInput.min = "0";
        priInput.max = "5";

        const moveLabel = document.createElement("label");
        moveLabel.htmlFor = "moveToProj";
        moveLabel.textContent = "Move to";
        const moveToProj = document.createElement("select");
        moveToProj.id = "moveToProj";
        moveToProj.name = "move";


        const BTNCont = document.createElement("div");
        BTNCont.className = "btnCont";
        const left = document.createElement("button");
        left.textContent = "Cancel";
        left.className = "left";
        const right = document.createElement("button");
        right.textContent = "Save";
        right.className = "right";
        right.value = "save";
        BTNCont.append(left, right);
        // complete Icon
        const doneBtn = document.createElement("img");
        doneBtn.src = completeIcon;
        doneBtn.alt = "Mark as complete";
        doneBtn.className = "doneBtn";
        doneBtn.addEventListener("click", () => {
            // cancel the todoEditDialog
            left.click();
            // click the doneBtn of the curr Todo
            document.querySelector(`.todoDIV#${projectUtil.selectedTodoID} > .doneBtn`).click();
        });

        editForm.append(basicCont, titleInput, desInput, settingCont, dueLabel, dueInput, priLabel, priInput, moveLabel, moveToProj, BTNCont, doneBtn);
        editDialog.appendChild(editForm);
        // update todo after saving
        editDialog.addEventListener("close", () => {
            if (!editDialog.returnValue) return;
            // get target TODO
            const todoID = projectUtil.selectedTodoID;
            const currProj = projectUtil.projectArr.get(projectUtil.selectedProjID);
            let currTodo;
            let oldPos;
            currProj.itemsArr.forEach((priMap, index) => {
                const temp = priMap.get(todoID);
                if (temp) {
                    currTodo = temp;
                    oldPos = index;
                }
            });
            const formData = Object.fromEntries(new FormData(editForm));

            const oldTitle = currTodo.title;
            const title = formData.title;
            if (oldTitle != title) {
                currTodo.title = title;
            }

            const oldDes = currTodo.description;
            const description = formData.description;

            if (oldDes != description) {
                currTodo.description = description;
            }

            const oldDue = currTodo.dueDate;
            const due = new Date(formData.due);

            if (oldDue.getTime() != due.getTime()) {
                currTodo.dueDate = due;
            }

            const oldProjID = projectUtil.selectedProjID;
            const newProjID = formData.move;
            const oldPri = currTodo.priority;
            const newPri = formData.priority;

            if (oldProjID != newProjID) {
                const newProj = projectUtil.projectArr.get(newProjID);
                currProj.itemsArr[oldPos].delete(todoID);
                if (oldPri != newPri) {
                    newProj.itemsArr[]
                }
                
            }

            if (oldPri != newPri) {
                currTodo.priority = newPri;
                // if finished todo skip in order to keep inside the last priority Map
                if (currTodo.done) break;
                currProj.itemsArr[oldPos].delete(todoID);
                const newPos = (newPri == 0) ? 5 : (newPri - 1);
                currProj.itemsArr[newPos].set(todoID, currTodo);
            }
            
        });


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


        
        document.body.append(sideBar, mainPanel, projDialog, toDoDialog, deletedialog, editDialog);

    };

})();