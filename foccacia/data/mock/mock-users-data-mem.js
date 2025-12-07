import crypto from 'node:crypto';

// MOCK of users data (async)
// This is a simple implementation: to be refactored.

const USERS = [
  {
    id: 1,
    token: 'b0506867-77c3-4142-9437-1f627deebd67',
    name: 'asilva'
  },
  {
    id: 2,
    token: 'f1d1cdbc-97f0-41c4-b206-051250684b19',
    name: 'pnunes'
  },
];
let currentId = USERS.length + 1;

export default function init(){

  return {
    addUser,
    getUserIdByToken,
    getUserIdByName
  };

  function nextId(){
    return(currentId++);
  }

  function addUser(username){
    return new Promise((resolve, reject) => {
      let user = {
        id: nextId(),
        token: crypto.randomUUID(),
        name: username
      };
      USERS.push(user);
      resolve(user);
    });
  }

  function getUserIdByToken(token){
    //console.log("Token:", token);
    return new Promise((resolve, reject) => {
      let user = USERS.find(user => user.token == token);
      //console.log(token, user);
      resolve(user?.id); // user id or undefined
    });
  }

  function getUserIdByName(username){
    return new Promise((resolve, reject) => {
      const user = USERS.find(user => user.name == username);
      resolve(user?.id); // user id or undefined
    });
  }
}