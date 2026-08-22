import { add, sub} from 'date-fns';

// factory func for creating todoItem
function createTodoItem(tit = "No Title", des = "No Description", due = new Date(), pri = 0){
    
    // base properties title, description, dueDate and priority
    let title = tit;
    let description = des;
    let dueDate = due;
    let priority = pri;
    let uid = crypto.randomUUID();
    let done = false;
    
    // edit funcs
    function changeTitle(newTitle) {
        this.title = newTitle;
    }

    function changeDes(newDes) {
        this.description = newDes;
    }

    function finishTask() {
        this.done = !(this.done);
    }

    function changeDue(newDate) {
        this.dueDate = newDate;
    }

    return {
        title,
        description,
        dueDate,
        priority,
        uid,
        changeTitle,
        changeDes,
        changeDue,
        finishTask,
    };
}

export {createTodoItem};