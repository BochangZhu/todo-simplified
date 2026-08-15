// module import
import { createTodoItem } from "./todoUtil.js";
import { projectUtil } from "./projectUtil.js";
import { domUtil } from "./domUtil.js";
// sideEffect import
import "./style.css";
import "./reset.css";
// load prev data
const loadSuccess = projectUtil.loadLocal();
// render page
domUtil.domInit(loadSuccess);
