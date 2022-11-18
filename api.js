const userCredentialsKey = 'User_Credentials';

const registerUser = () => {
  if (localStorage.getItem(userCredentialsKey) === null) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://localhost:7270/registeruser', false);

    xhr.send();
    const data = xhr.response;
    localStorage.setItem(userCredentialsKey, data);
    xhr.onerror = () => {
      console.log('request failed');
    };
  }
};



registerUser();


const userId = JSON.parse(localStorage.getItem(userCredentialsKey)).userId;
const token = JSON.parse(localStorage.getItem(userCredentialsKey)).token;

const apiUrl = 'https://localhost:7270/';
const registerUrl = apiUrl + 'registeruser';
const upsertUrl = apiUrl + 'checklist/upsert';
const getAllCheckListsUrl = apiUrl + 'checklist/getall?userId=' + userId;
const getCheckListByIdUrl =
  apiUrl + 'checklist?userId=' + userId + '&checkListId=';
const deleteCheckListByIdUrl =
  apiUrl + 'checklist/delete?userId=' + userId + '&checkListId=';
const updateSharedChecklistUrl =
  apiUrl + 'checklist/updateshared?userid=' + userId + '&code=';
const getCheckListShareCodeUrl = apiUrl + 'checklist/generatesharecode';
const getCheckListFromCodeUrl =
  apiUrl + 'checklist/getchecklist?userid=' + userId + '&code=';


const getAllCheckLists = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await fetch(getAllCheckListsUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        }
      });

      resolve(res.json());
    } catch (error) {
      reject(error);
    }
  });
};

const upsertCheckList = async (checklist) => {
  checklist.userId = userId;
  return new Promise(async (resolve, reject) => {
    try {
      const res = await fetch(upsertUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        },
        body: JSON.stringify(checklist)
      });

      resolve(res.json());
    } catch (error) {
      reject(error);
    }
  });
};
const getCheckListById = async (checkListId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await fetch(getCheckListByIdUrl + checkListId, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        }
      });
      
      resolve(res.json());
    } catch (error) {
      reject(error);
    }
  });
};
const deleteCheckListById = async (checkListId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await fetch(deleteCheckListByIdUrl + checkListId, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        },
        body: JSON.stringify({ id: checkListId })
      });

      resolve(res.json());
    } catch (error) {
      reject(error);
    }
  });
};

const getCheckListFromCode = async (code) => {
  return new Promise(async (resolve, reject) => {
    //url encode the code

    try {
      const res = await fetch(getCheckListFromCodeUrl + code, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        }
      });

      resolve(res.json());
    } catch (error) {
      reject(error);
    }
  });
};

const generateCheckListShareCode = async (checklistId, permission) => {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await fetch(getCheckListShareCodeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        },
        body: JSON.stringify({
          Id: checklistId,
          userId: userId,
          permissions: permission
        })
      });

      resolve(res);
    } catch (error) {
      reject(error);
    }
  });
};

const updateSharedChecklist = async (checklist, code) => {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await fetch(updateSharedChecklistUrl + code, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        },
        body: JSON.stringify(checklist)
      });

      resolve(res.json());
    } catch (error) {
      reject(error);
    }
  });
};
