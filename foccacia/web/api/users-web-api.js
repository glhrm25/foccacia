import { errorToHttp } from "./errors-to-http-responses.js";

// FUNCTIONS (WEB API):

export default function init(usersServices){

  // Verify the dependencies:
  if(! usersServices){
    return Promise.reject(errors.INVALID_ARGUMENT('usersServices'));
  }

  return {
    addUser
  };

  function addUser(req, res){
    const userPromise = usersServices.addUser(req.body.username);
    return userPromise.then(user => {
      res.status(201);
      res.json({token: user.token});
    })
    .catch(internalError => {
      const error = errorToHttp(internalError);
      res.status(error.status);
      res.json(error.body);
    });
  }
}