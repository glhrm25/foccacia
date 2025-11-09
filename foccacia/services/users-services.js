import { errors } from '../commons/internal-errors.js';

// Users Services:

export default function init(userData){

  // Verify the dependencies:
  if(! userData){
    throw errors.INVALID_ARGUMENT('usersServices');
  }

  return {
    addUser,
    getUserId
  };

  function addUser(username){
    if (! username) {
      return errors.INVALID_USER(username);    
    }
    const userId = userData.getUserIdByName(username);
    if (userId) {
      return errors.USER_ALREADY_EXISTS(username);
    }
    const user = userData.addUser(username);
    return user;
  }

  // Auxiliary function: get userId by token
  function getUserId(token){
    return userData.getUserId(token);
  }
}