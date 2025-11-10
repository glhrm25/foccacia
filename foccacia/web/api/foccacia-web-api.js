//import * as tasksServices from "../../services/tasks-services.mjs";
import { errorToHttp  } from "./errors-to-http-responses.js";
import { errors } from "../../commons/internal-errors.js";

// FUNCTIONS (WEB API):

export default function init(groupsServices) {

    // Verify the dependencies:
    if(! groupsServices){
      throw errors.INVALID_ARGUMENT('groupsServices');
    }

    return {
      getTeams: processRequest(internal_getTeams),
      getCompetitions: processRequest(internal_getCompetitions),
      getAllGroups: processRequest(internal_getAllGroups),
      getGroup: processRequest(internal_getGroup),
      addGroup: processRequest(internal_addGroup),
      updateGroup: processRequest(internal_updateGroup),
      deleteGroup: processRequest(internal_deleteGroup),
      addPlayerToGroup: processRequest(internal_addPlayerToGroup),
      removePlayerFromGroup: processRequest(internal_removePlayerFromGroup),
    };

    function processRequest(operation){
      return async function (req, res){
        const token = getToken(req);
        // Handling missing token
        if (!token){
          const error = errorToHttp(errors.MISSING_TOKEN());
          res.status(error.status);
          res.json(error.body);
          return ;
        }
        req.userToken = token;
        /*
        const internalError = operation(req, res);
        // Handling services errors
        if (internalError){
          const error = errorToHttp(internalError);
          res.status(error.status);
          res.json(error.body);
        }*/
        try {
          const internalError = await operation(req, res);

          // Handling service errors (caso a função retorne erro)
          if (internalError) {
            const error = errorToHttp(internalError);
            return res.status(error.status).json(error.body);
          }
        } 
        catch (err) {
          console.error("Unexpected error:", err);
          return res.status(500).json({ message: "Internal Server Error" });
        }
      }
    }

    async function internal_getCompetitions(req, res){
      const output = await groupsServices.getCompetitions(req.userToken);
      if (output.internalError) return output;

      // Success case
      res.json(output);
    }

    async function internal_getTeams(req, res){
      const output = await groupsServices.getTeams(req.params.competitionCode, req.params.season, req.userToken);
      if (output.internalError) return output;

      // Success case
      res.json({teams: output});
    }

    function internal_getAllGroups(req, res){
      const output = groupsServices.getAllGroups(req.userToken);
      if (output.internalError) return output;

      // Success case
      res.json({groups : output});
    }

    function internal_getGroup(req, res){
      const output = groupsServices.getGroup(req.userToken, req.params.groupName);
      if (output.internalError) return output;

      // Success case
      res.json({group: output});
    }

    function internal_addGroup(req, res){
      const output = groupsServices.addGroup(req.userToken, req.body);
      if (output.internalError) return output;

      // Success case
      const group = output;
      res.status(201);
      res.json({
        status: `Group ${group.name} was added!`,
        group: group
      });
    }

    function internal_deleteGroup(req, res){
      const groupName = req.params.groupName
      let output = groupsServices.deleteGroup(req.userToken, groupName);

      // Success case
      if (output.internalError) return output;
      res.json({
        status: `Group ${groupName} was deleted!`,
      });
    }

    function internal_updateGroup(req, res){
      const groupName = req.params.groupName
      let output = groupsServices.updateGroup(req.userToken, groupName, req.body);
      if (output.internalError) return output;

      // Success case
      const updatedGroup = output;
      res.json({
        status: `Group ${groupName} was updated!`,
        group: updatedGroup
      });
    }

    function internal_addPlayerToGroup(req, res){
      const groupName = req.params.groupName
      let output = groupsServices.addPlayerToGroup(req.userToken, groupName, req.body);
      if (output.internalError) return output;

      // Success case
      const group = output;
      res.status(201)
      res.json({
        status: `Added player to group ${groupName}!`,
        group: group
      });
    }  

    function internal_removePlayerFromGroup(req, res){
      const groupName = req.params.groupName
      const playerId = req.params.playerId
      let output = groupsServices.removePlayerFromGroup(req.userToken, groupName, playerId);
      if (output.internalError) return output;
      // Success case
      res.json({
        status: `Player ${playerId} from group ${groupName} was removed!`,
      });
    }

    // Auxiliary module function
    function getToken(req) {
      const authToken = req.get("Authorization");
      if (authToken){
        console.log(authToken);
        const tokenParts = authToken.split(" ");
        if(tokenParts && tokenParts[0] == "Bearer") {
            return tokenParts[1];
        }
      }
    }
}