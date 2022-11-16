//select editorDiv
console.log('main js loaded 1');
const codeUrlPrefix = 'http://127.0.0.1:5500?code=';
const editorDiv = document.querySelector('#sl-checklist-container');
const checkListHeading = document.querySelector('#sl-checklist-heading');
const saveBtn = document.querySelector('#sl-save-btn');
const shareBtn = document.querySelector('#sl-share-btn');
const deleteBtn = document.querySelector('#sl-delete-btn');
const checklistPage = document.querySelector('#sl-checklist-list');
const editorPage = document.querySelector('#sl-checklist-editor');
const checklistListContainer = document.querySelector(
  '#sl-checklist-list-container'
);

const checklistActions = document.querySelector('#sl-checklist-actions');
const newCheckListBtn = document.querySelector('#sl-newchecklist-btn');
const myCheckListsBtn = document.querySelector('#sl-mychecklists-btn');
const emptyListDiv = document.querySelector('#sl-empty-list');
const deleteModal = document.querySelector('#sl-delete-modal');
const deleteModalCloseBtn = document.querySelector(
  '#sl-delete-modal-close-btn'
);
const deleteModalCancelBtn = document.querySelector('#sl-delete-modal-cancel');
const deleteModalConfirmBtn = document.querySelector(
  '#sl-delete-modal-confirm'
);

const shareModal = document.querySelector('#sl-share-modal');
const shareModalReadOnlyBtn = document.querySelector(
  '#sl-share-modal-readonly'
);
const shareModalReadWriteBtn = document.querySelector(
  '#sl-share-modal-readwrite'
);
const shareModalCloseBtn = document.querySelector('#sl-share-modal-close-btn');
const shareLinkCopyBtn = document.querySelector('#sl-copy-link-btn');
const shareLinkBox = document.querySelector('#sl-share-link-box');

const stateKey = 'Active_State';
const checklistsKey = 'User_Checklists';
const activeCheckListKey = 'Active_Checklist';
const sharedChecklistsKey = 'Shared_Checklists';

//initial state

let checkLists = [];
const code = getCodeFromUrl();
let activeState = 'editor';
let newList = {};
newList.name = 'New Checklist';
newList.checkListItems = [];
let activeCheckList = getActiveCheckList();

window.onload = async function () {
  if (
    localStorage.getItem(userCredentialsKey) !== null &&
    (code !== undefined || activeCheckList.code !== undefined)
  ) {
    let codeFromUrl = code || activeCheckList.code;
    console.log(codeFromUrl);
    checkLists = await getAllCheckLists();
    getCheckListFromCode(codeFromUrl).then((data) => {
      let checklist = data.checkListModel;
      checklist.permission = data.permissions;
      checklist.code = codeFromUrl;

      populateChecklist(checklist);

      checkLists.push(checklist);
      let sharedLists = getSharedCheckLists();
      //push if not already present
      if (
        sharedLists.findIndex((list) => list.code === checklist.code) === -1
      ) {
        sharedLists.push(checklist);
        setSharedCheckLists(sharedLists);
      }

      changeActiveState('editor', changeActiveStateCallback);
    });
  }
  checkLists = await getAllCheckLists();
  let sharedLists = getSharedCheckLists();
  if (sharedLists.length > 0) {
    sharedLists.forEach((list) => {
      checkLists.push(list);
    });
  }
  console.log(checkLists);
  listCheckLists();
  activeState = getActiveState();
  activeCheckList = getActiveCheckList();
  if (activeState === 'editor') {
    if (activeCheckList !== null) {
      getCheckListById(activeCheckList.id)
        .then((data) => {
          changeActiveState('editor', changeActiveStateCallback);
          console.log(data);
          setActiveCheckList(data);
          populateChecklist(activeCheckList);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  } else {
    changeActiveState('checklist', changeActiveStateCallback);
  }
};

window.onclick = function (event) {
  if (event.target == deleteModal || event.target == shareModal) {
    deleteModal.style.display = 'none';
    shareModal.style.display = 'none';
    shareLinkBox.value = '';
  }
};
//after window loaded

editorDiv.addEventListener('keydown', function (e) {
  var element = window.getSelection().getRangeAt(0)
    .commonAncestorContainer.parentNode;
  var index = Array.prototype.indexOf.call(
    element.parentNode.children,
    element
  );
  var count = 0;

  if (e.key === 'Enter') {
    handleEnterPress(e, count, index);
  }
});
//detect changes in editor
editorDiv.addEventListener('input', function (e) {
  console.log('editor changed');
  controlSaveBtnState();
  controlDeleteBtnState();
  controlShareBtnState();
});

saveBtn.addEventListener('click', function () {
  //localStorage.setItem('checklist', JSON.stringify(checklist));

  var checklist = checklistFromEditor();
  console.log(checklist);
  //disable save button
  saveBtn.disabled = true;
  saveBtn.innerHTML = 'Saving...';

  if (activeCheckList.code !== undefined) {
    let code = activeCheckList.code;
    let permission = activeCheckList.permission;
    updateSharedChecklist(checklist, code)
      .then((data) => {
        data.code = code;
        data.permission = permission;
        setActiveCheckList(data);

        var index = checkLists.findIndex(
          (checkList) => checkList.id === activeCheckList.id
        );
        if (index === -1) {
          checkLists.push(activeCheckList);
        } else {
          checkLists[index] = activeCheckList;
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    upsertCheckList(activeCheckList)
      .then((data) => {
        setActiveCheckList(data);

        var index = checkLists.findIndex(
          (checkList) => checkList.id === activeCheckList.id
        );
        if (index === -1) {
          checkLists.push(activeCheckList);
        } else {
          checkLists[index] = activeCheckList;
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  saveBtn.innerHTML = 'Saved';
  deleteBtn.disabled = false;
  shareBtn.disabled = false;
  setTimeout(() => {
    saveBtn.innerHTML = 'Save';
  }, 2000);
});

myCheckListsBtn.addEventListener('click', function () {
  changeActiveState('checklist', changeActiveStateCallback);
  listCheckLists();
});

newCheckListBtn.addEventListener('click', function () {
  handleNewBtnClick();
  changeActiveState('editor', changeActiveStateCallback);
});

deleteModalCancelBtn.addEventListener('click', function () {
  deleteModal.style.display = 'none';
});
deleteModalCloseBtn.addEventListener('click', function () {
  deleteModal.style.display = 'none';
});

// deleteBtn.addEventListener('click', function () {
//   //show

//   deleteModal.style.display = 'block';
//   //handle modal confirm
// });
deleteModalConfirmBtn.addEventListener('click', function () {
  deleteCheckListById(activeCheckList.id);
  //remove checklist from checklist object
  checkLists = checkLists.filter((checklist) => {
    return checklist.id !== activeCheckList.id;
  });
  console.log(checkLists);
  setActiveCheckList(newList);

  changeActiveState('checklist', changeActiveStateCallback);
  listCheckLists();
  deleteModal.style.display = 'none';
});

shareBtn.addEventListener('click', function () {
  shareModal.style.display = 'block';
});

shareModalCloseBtn.addEventListener('click', function () {
  shareModal.style.display = 'none';
  shareLinkBox.value = '';
});

shareModalReadOnlyBtn.addEventListener('click', function () {
  generateCheckListShareCode(activeCheckList.id, 0)
    .then((data) => {
      data.text().then((text) => {
        shareLinkBox.value = codeUrlPrefix + text;
      });
    })
    .catch((error) => {
      console.log(error);
    });
});
shareModalReadWriteBtn.addEventListener('click', function () {
  generateCheckListShareCode(activeCheckList.id, 1)
    .then((data) => {
      data.text().then((text) => {
        shareLinkBox.value = codeUrlPrefix + text;
        console.log(text);
      });
    })
    .catch((error) => {
      console.log(error);
    });
});

shareLinkCopyBtn.addEventListener('click', function () {
  //get share link text
  var shareLink = shareLinkBox.value;
  //copy to clipboard
  navigator.clipboard.writeText(shareLink).then(console.log('copied'));
});

//disable save btn if no changes

function handleEnterPress(e, count, index) {
  e.preventDefault();

  count++;
  //create label with checkbox

  var label = document.createElement('label');
  label.setAttribute('class', 'sl-checkListItem');
  label.setAttribute('id', 'sl-label-' + count);
  var input = document.createElement('input');
  input.setAttribute('type', 'checkbox');
  input.setAttribute('id', 'sl-checkbox-' + count);

  label.appendChild(input);
  editorDiv.insertBefore(label, editorDiv.children[index + 1]);

  moveCursorToEnd(label);
}
//log checklist on button click

function checklistFromEditor() {
  activeCheckList.name = checkListHeading.innerText;
  activeCheckList.checkListItems = [];

  var checkboxes = document.querySelectorAll('input[type=checkbox]');
  for (var i = 0; i < checkboxes.length; i++) {
    activeCheckList.checkListItems.push({
      checkListItemLabel: checkboxes[i].parentNode.innerText,
      isChecked: checkboxes[i].checked
    });
  }
  console.log(activeCheckList);
  return activeCheckList;
}

// handle new button click
function handleNewBtnClick() {
  setActiveCheckList(newList);
  checkListHeading.innerText = 'New Checklist';
  var labels = document.querySelectorAll('label');
  for (var i = 0; i < labels.length; i++) {
    labels[i].remove();
  }
  moveCursorToEnd(checkListHeading);
}

//move cursor to end of an element
function moveCursorToEnd(element) {
  const range = new Range();
  range.selectNodeContents(element);
  range.collapse(false);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

//populate checklist
function populateChecklist(checklist) {
  handleNewBtnClick();
  console.log(checklist);
  setActiveCheckList(checklist);
  checkListHeading.innerText = 'New Checklist';
  if (checklist !== null && checklist.checkListItems.length > 0) {
    checkListHeading.innerText = checklist.name;
    for (var i = 0; i < checklist.checkListItems.length; i++) {
      var label = document.createElement('label');
      label.setAttribute('class', 'sl-checkListItem');
      label.setAttribute('id', 'sl-label-' + i);
      var input = document.createElement('input');
      input.setAttribute('type', 'checkbox');
      input.setAttribute('id', 'sl-checkbox-' + i);
      if (checklist.checkListItems[i].isChecked) {
        input.setAttribute('checked', 'checked');
      }
      label.appendChild(input);

      var text = document.createTextNode(
        checklist.checkListItems[i].checkListItemLabel
      );
      label.appendChild(text);
      editorDiv.appendChild(label);
    }
  }
  changeActiveState('editor', changeActiveStateCallback);
}

function populateSharedChecklist(code) {
  getCheckListFromCode(code)
    .then((data) => {
      console.log(data);
      data.checkListModel.permission = data.permissions;
      data.checkListModel.code = code;

      populateChecklist(data.checkListModel);
    })
    .catch((error) => {
      console.log(error);
    });
}
//list checklists
function listCheckLists() {
  console.log('list checklists');
  var ul = document.querySelector('#sl-checklist-list-ul');
  ul.innerHTML = '';

  //create span element

  for (var i = 0; i < checkLists.length; i++) {
    var li = document.createElement('li');
    var text = document.createTextNode(checkLists[i].name);
    li.setAttribute('class', 'sl-checklist-list-li');
    li.setAttribute('id', 'sl-checklist-list-li-' + i);
    if (checkLists[i].code) {
      li.setAttribute(
        'onclick',
        'populateSharedChecklist("' + checkLists[i].code + '")'
      );
      let linkSymbol = document.createElement('span');
      linkSymbol.innerHTML = '&#128279;';
      li.appendChild(linkSymbol);
      console.log('shared checklists');
    } else {
      li.setAttribute('onclick', 'populateChecklist(checkLists[' + i + '])');
    }

    li.appendChild(text);

    ul.appendChild(li);
  }
}

//transition to checklist page
// function transitionToChecklistPage() {
//   checklistPage.style.display = 'block';
//   editorPage.style.display = 'none';
//   if (checkLists.length > 0) {
//     listCheckLists();
//     checklistListContainer.style.display = 'block';
//     emptyListDiv.style.display = 'none';
//   } else {
//     checklistListContainer.style.display = 'none';
//     emptyListDiv.style.display = 'block';
//   }
// }
// function transitionToEditorPage() {
//   editorPage.style.display = 'block';
//   checklistPage.style.display = 'none';
// }
function getCodeFromUrl() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  let codeParam = urlParams.get('code');
  if (codeParam !== null) {
    //remove query string
    window.history.replaceState({}, document.title, '/');
    console.log(codeParam);
    console.log(document.title);
    //replace spaces with +
    codeParam = codeParam.replace(/ /g, '+');
    console.log(codeParam);
    return codeParam;
  }
}
function changeActiveState(state, myCallback) {
  localStorage.setItem(stateKey, state);
  myCallback(state);
}
function getActiveState() {
  return localStorage.getItem(stateKey) || 'editor';
}

function changeActiveStateCallback(state) {
  if (state === 'editor') {
    console.log('callback');
    if (
      activeCheckList['permission'] !== undefined &&
      activeCheckList.permission === 0
    ) {
      //contenteditable="false"
      editorDiv.setAttribute('contenteditable', 'false');
    } else {
      checklistActions.style.display = 'flex';
      editorDiv.setAttribute('contenteditable', 'true');
    }
    controlSaveBtnState();
    controlDeleteBtnState();
    controlShareBtnState();
    editorPage.style.display = 'block';
    checklistPage.style.display = 'none';
    moveCursorToEnd(checkListHeading);
  } else if (state === 'checklist') {
    //add shared checklists to checklists

    checklistPage.style.display = 'block';
    editorPage.style.display = 'none';
    if (checkLists.length > 0) {
      checklistListContainer.style.display = 'block';
      emptyListDiv.style.display = 'none';
    } else {
      checklistListContainer.style.display = 'none';
      emptyListDiv.style.display = 'block';
    }
  }
}

function setActiveCheckList(checklist) {
  localStorage.setItem(activeCheckListKey, JSON.stringify(checklist));
  activeCheckList = checklist;
}
function getActiveCheckList() {
  return JSON.parse(localStorage.getItem(activeCheckListKey)) || newList;
}

function setSharedCheckLists(checklists) {
  localStorage.setItem(sharedChecklistsKey, JSON.stringify(checklists));
}
function getSharedCheckLists() {
  return JSON.parse(localStorage.getItem(sharedChecklistsKey)) || [];
}

function controlShareBtnState() {
  if (
    activeCheckList.checkListItems.length > 0 &&
    activeCheckList.id !== undefined &&
    activeCheckList.code == undefined
  ) {
    shareBtn.disabled = false;
  } else {
    shareBtn.disabled = true;
  }
  console.log('sharebt');
}
function controlDeleteBtnState() {
  if (activeCheckList.id !== undefined) {
    deleteBtn.disabled = false;
  } else {
    deleteBtn.disabled = true;
  }
  if (activeCheckList.code !== undefined) {
    deleteBtn.innerHTML = 'Remove';
    deleteBtn.onclick = removeSharedChecklist;
  } else {
    deleteBtn.innerHTML = 'Delete';
    deleteBtn.onclick = () => {
      deleteModal.style.display = 'block';
    };
  }
}
function controlSaveBtnState() {
  //array from label text
  let currentChecklist = [
    ...document.querySelectorAll('input[type=checkbox')
  ].map((item) => {
    return {
      isChecked: item.checked,
      checkListItemLabel: item.parentNode.innerText
    };
  });

  var checklist = getActiveCheckList();

  const isItemsNotChanged =
    JSON.stringify(currentChecklist) ===
    JSON.stringify(checklist.checkListItems);
  console.log(checkListHeading.innerHTML);
  const isTitleNotChanged = checkListHeading.innerHTML === checklist.name;

  if (
    currentChecklist.length > 0 &&
    (!isItemsNotChanged || !isTitleNotChanged)
  ) {
    saveBtn.disabled = false;
  } else {
    saveBtn.disabled = true;
  }
}

function removeSharedChecklist() {
  console.log('remove shared');
  let sharedChecklists = getSharedCheckLists();
  let code = activeCheckList.code;
  let index = sharedChecklists.findIndex((item) => item.code === code);
  sharedChecklists.splice(index, 1);
  setSharedCheckLists(sharedChecklists);
  //remove from checklists
  let index2 = checkLists.findIndex((item) => item.code === code);
  checkLists.splice(index2, 1);
  setActiveCheckList(newList);
  listCheckLists();
  changeActiveState('checklist', changeActiveStateCallback);
}

//catch all events on editor div

//on checklist click

// const checklistListElement = `   <div id="sl-checklist-list" >
// <div id="sl-checklist-picker">
//   <div id="sl-checklist-header">
//     <h3>My Checklists</h3>
//   </div>
//   <div id="sl-checklist-list-container">
//     <ul id="sl-checklist-list-ul"></ul>
//   </div>
// </div>
// <div id="sl-newchecklist">
//   <button id="sl-newchecklist-btn">Create New</button>
// </div>
// </div>`;

// const checklistEditorElement = `     <div id="sl-checklist-editor">
// <div id="sl-mychecklists">
//   <button id="sl-mychecklists-btn">
//     <span id="sl-back-arrow">&#5176;&#5176;</span> My Checklists
//   </button>
// </div>
// <div id="sl-checklist-container" contenteditable="true">
//   <h3 id="sl-checkListHeading">New Checklist</h3>
// </div>

// <div id="sl-checklist-actions">
//   <button id="sl-save-btn" tabindex="0">Save</button>
//   <button id="sl-share-btn" tabindex="1">Share</button>
//   <button id="sl-delete-btn" tabindex="2">Delete</button>
// </div>
// </div>
// `;
// let currentElement = checklistEditorElement;
// const wrapper = document.querySelector('#sl-wrapper');
// window.onload = function () {
//   wrapper.insertAdjacentHTML('afterbegin', currentElement);
// };
// const button = document.querySelector('#sl-change-btn');
// button.addEventListener('click', function () {
//   changePage(currentElement, handlePageChange);
// });
// function changePage(el, pageChangeCallback) {
//   if (el === checklistEditorElement) {
//     currentElement = checklistListElement;
//   } else {
//     currentElement = checklistEditorElement;
//   }
//   console.log('change page');
//   pageChangeCallback(currentElement);
// }
// function handlePageChange(element) {
//   wrapper.innerHTML = '';
//   wrapper.insertAdjacentHTML('afterbegin', element);
//   console.log('page called');
//   console.log(element);
// }

// const elementState = (initialElement) => {
//   let value;

//   if (!initialElement) {
//     value = checklistEditorElement;
//   } else {
//     value = initialElement;
//   }

//   const setValue = (newValue) => {
//     value = newValue;
//   };
//   return [value, setValue];
// };

// const [element, setElement] = elementState();
// const wrapper = document.querySelector('#sl-wrapper');
// window.onload = function () {
//   wrapper.insertAdjacentHTML('afterbegin', element);
// };

// editorDiv.addEventListener('click', function (e) {
//   console.log(
//     window.getSelection().getRangeAt(0).commonAncestorContainer.parentNode
//   );
//   var element = window.getSelection().getRangeAt(0)
//     .commonAncestorContainer.parentNode;
//   var index = Array.prototype.indexOf.call(
//     element.parentNode.children,
//     element
//   );
//   console.log(index);
//   // console.log(window.getSelection().anchorNode);
//   //   const sel = window.getSelection();
//   //   console.log(sel.focusNode);
//   //   console.log(sel.focusOffset);
//   //   console.log(sel.isCollapsed);
//   //   console.log(sel.type);
// });
// //log node where cursor is
// editorDiv.addEventListener('keyup', function (e) {
//   console.log(window.getSelection().anchorNode);
//   console.log(window.getSelection().focusNode);
//   console.log(window.getSelection().focusOffset);
//   console.log(window.getSelection().isCollapsed);
//   console.log(window.getSelection().type);
//   console.log(window.getSelection().rangeCount);
//   console.log(e.target);
// });
// //log selection on selection changed
// editorDiv.addEventListener('selectionchange', function (e) {
//   console.log(window.getSelection());
//   console.log(window.getSelection().anchorNode);
// });
// //log caret location on change
// editorDiv.addEventListener('keyup', function (e) {
//   console.log(window.getSelection());
//   console.log(window.getSelection().anchorNode);
// });
