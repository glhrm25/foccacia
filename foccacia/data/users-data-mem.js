import crypto from 'node:crypto';

// Memory Users data
// TODO: more CRUD methods

const USERS = [];

function User(username){
  User.counter = User.counter === undefined ?
                USERS.length + 1 : User.counter + 1;
  this.id = USERS.counter;
  this.name = username;
  this.token = crypto.randomUUID();
}

export default function init(){

  return {
    addUser,
    getUserId,
    getUserIdByName
  }

  function addUser(username){
    return new Promise((resolve, reject) => {
      const user = new User(username);
      USERS.push(user);
      resolve(user);
    });
  }

  function getUserId(token){
    return new Promise((resolve, reject) => {
      let user = USERS.find(user => user.token == token);
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