const userCredentialsKey = 'User_Credentials';
// const registerUser = async () => {
//   try {
//     const res = await fetch('https://localhost:7270/registeruser');
//     const data = await res.json();
//     await localStorage.setItem(userCredentialsKey, JSON.stringify(data));
//     console.log('User registered');
//   } catch (err) {
//     console.log(err);
//   }
// };
// registerUser();
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

//   res.send();
//   const data = JSON.parse(res.responseText);
//   localStorage.setItem(userCredentialsKey, JSON.stringify(data));
//   console.log('data stored');

registerUser();
// function registerUser(myCallback) {
//   if (localStorage.getItem(userCredentialsKey) === null) {
//     fetch('https://localhost:7270/registeruser')
//       .then((res) => res.json())
//       .then((data) => {
//         myCallback(data);
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }
// }
// let userId;
// let token;
// const setCreds = (creds) => {
//   localStorage.setItem(userCredentialsKey, JSON.stringify(creds));
//   userId = localStorage.getItem(userCredentialsKey).userId;
//   token = localStorage.getItem(userCredentialsKey).token;
//   console.log('set creds');
//   console.log(creds);
// };
// registerUser(setCreds);

const userId = JSON.parse(localStorage.getItem(userCredentialsKey)).userId;
const token = JSON.parse(localStorage.getItem(userCredentialsKey)).token;
console.log(userId);

const apiUrl = 'https://localhost:7270/';
const registerUrl = apiUrl + 'registeruser';
const upsertUrl = apiUrl + 'checklist/upsert';
const getAllCheckListsUrl = apiUrl + 'checklist/getall?userId=' + userId;
console.log(getAllCheckListsUrl);
const getCheckListByIdUrl =
  apiUrl + 'checklist?userId=' + userId + '&checkListId=';
const deleteCheckListByIdUrl =
  apiUrl + 'checklist/delete?userId=' + userId + '&checkListId=';
const updateSharedChecklistUrl =
  apiUrl + 'checklist/updateshared?userid=' + userId + '&code=';
const getCheckListShareCodeUrl = apiUrl + 'checklist/generatesharecode';
const getCheckListFromCodeUrl =
  apiUrl + 'checklist/getchecklist?userid=' + userId + '&code=';

console.log('api.js loaded 2');

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
