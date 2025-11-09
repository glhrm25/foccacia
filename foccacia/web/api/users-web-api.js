//import * as usersServices from "../../services/users-services.mjs";
import { errorToHttp } from "./errors-to-http-responses.js";

// FUNCTIONS (WEB API):

export default function init(usersServices){

  // Verify the dependencies:
  if(! usersServices){
    throw errors.INVALID_ARGUMENT('usersServices');
  }

  return {
    addUser
  };

  function addUser(req, res){
    //console.log(req.body);
    const output = usersServices.addUser(req.body.username);
    if (output.internalError){
      const error = errorToHttp(output);
      res.status(error.status);
      res.json(error.body);
      return ;
    }
    // Success
    const user = output;
    res.status(201);
    res.json({token: user.token});
  }

}