import { errors } from '../commons/internal-errors.js';

// Users Services:

export default function init(userData){

  // Verify the module dependencies:
  if(! userData){
    throw errors.INVALID_ARGUMENT('usersServices');
  }

  return {
    addUser,
    getUser: getMatchedCredentialsUser,
    getUserId
  };

  function addUser(username, password){
    if (! username) {
      return Promise.reject(errors.INVALID_USER(username));
    }
    const userIdPromise = userData.getUserIdByName(username);
    return userIdPromise.then(userId => {
      if (userId) {
        return Promise.reject(errors.USER_ALREADY_EXISTS(username));
      }
      return userData.addUser(username, password);
    });
  }

  // Returns the respective user by its credentials
  function getMatchedCredentialsUser(username, password){
    const userPromise = userData.getUser(username, password)
    return userPromise.then(user => {
      if (!user) return Promise.reject(errors.USER_NOT_FOUND(username))
      else if (password != user.password) return Promise.reject(errors.INVALID_CREDENTIALS())
      else return user
    })
  }

  // Auxiliary function: get userId by token
  function getUserId(token){
    return userData.getUserIdByToken(token);
  }
}