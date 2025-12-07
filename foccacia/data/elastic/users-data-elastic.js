import crypto from 'node:crypto';
//import { errors } from '../../commons/internal-errors.mjs';
import { fetchElastic } from './fetch-elastic.mjs';

// FUNCTIONS (API users with Elasticsearch database):

function User(username){
  this.name = username;
  this.token = crypto.randomUUID();
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

export default function init(){

  return {
    getUserIdByName,
    getUserIdByToken,
    addUser
  }

  function getUserIdByName(username){
    return getUserId({name: username});
  }

  function getUserIdByToken(token){
    return getUserId({token: token});
  }

  function addUser(username){   
    const user = new User(username);
    return fetchElastic("POST", "/users/_doc", user)
      .then(body => {
        return joinUserId(user, body._id);
      });  
  }
}