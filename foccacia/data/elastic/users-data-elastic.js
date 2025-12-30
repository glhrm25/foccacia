import crypto from 'node:crypto';
//import { errors } from '../commons/internal-errors.js';
import { fetchElastic } from './fetch-elastic.js';

// FUNCTIONS (API users with Elasticsearch database):

class User {
  constructor(username, password) {
    this.name = username;
    this.password = password;
    this.token = crypto.randomUUID();
  }
}

function joinUserId(user, userId) {
    return Object.assign({id: userId}, user);
}

function getUserId(matchObj){
  const match = {
    query: {
      match: matchObj
    }
  };
  return fetchElastic("POST", "/users/_search", match)
  .then(body => {
      if (body.error){
        console.error("Elastic error:", body.error.reason);
        return undefined;
      }
      const usersArray = body.hits.hits;
      //console.log(usersArray);
      if(usersArray.length > 0)
        return(usersArray[0]._id);
    }
  );
}

function getUserBy(matchObj){
  const match = {
    query: {
      match: matchObj
    }
  };
  return fetchElastic("POST", "/users/_search", match)
  .then(body => {
      if (body.error){
        console.error("Elastic error:", body.error.reason);
        return undefined;
      }
      const usersArray = body.hits.hits;
      if(usersArray.length > 0)
        return joinUserId(usersArray[0]._source, usersArray[0]._id)
    }
  );
}

export default function init(){

  return {
    getUserIdByName,
    getUserIdByToken,
    getUser,
    getUserById,
    addUser
  }

  function getUserIdByName(username){
    return getUserBy({name: username})
      .then(user => {
        return user ? user.id : user;
      })
  }

  function getUserIdByToken(token){
    return getUserBy({token: token})
      .then(user => {
        return user ? user.id : user;
      });
  }

  function getUser(username){
    return getUserBy({name: username})
  }

  function getUserById(userId){
    return fetchElastic("GET", `/users/_doc/${userId}`)
    .then(body => {
        if (body.error){
          console.error("Elastic error:", body.error.reason);
          return undefined;
        }
        return joinUserId(body._source, body._id)
      }
    );
  }

  function addUser(username, password){   
    const user = new User(username, password);
    return fetchElastic("POST", "/users/_doc", user)
      .then(body => {
        return joinUserId(user, body._id);
      });  
  }
}