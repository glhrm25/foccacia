//import * as tasksServices from "../../services/tasks-services.mjs";
import { errorToHttp  } from "../errors-to-http-responses.js";
import { errors } from "../../commons/internal-errors.js";

// Input: the Response Object and the internal error object to be set.
function setHttpError(res, internalError) {
  const error = errorToHttp(internalError)
  res.status(error.status);
  res.json(error.body);
}

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
      errorHandler: errorHandler
    };

    function processRequest(operation){
      return function (req, res, next){
        const token = getToken(req);
        // Handling missing token
        if (! token){
          next(errors.MISSING_TOKEN());
        }
        else {
          req.userToken = token;
          // Call the operation:
          operation(req, res).catch(next);
        }
      };
    }

    function errorHandler(err, req, res, next){
      let error = err;
      console.log(error)
      if (err instanceof SyntaxError && err.type == "entity.parse.failed") {
        error = errors.INVALID_JSON_PARSER();
      }
      setHttpError(res, error);
    }

    async function internal_getCompetitions(req, res){
      const output = await groupsServices.getCompetitions(req.query);
      if (output.internalError) return output
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
      return groupsServices.getAllGroups(req.userToken, req.query).then(
        groups => {
          res.json({groups: groups})
        }
      )
    }

    function internal_getGroup(req, res){
      return groupsServices.getGroup(req.userToken, req.params.groupId).then(
        groups => {
          res.json({groups: groups})
        }
      )
    }

    function internal_addGroup(req, res){
      return groupsServices.addGroup(req.userToken, req.body).then(
        group => {
          res.status(201);
          res.json({
            status: `Group ${group.name} was added!`,
            group: group
          });
        })
    }

    function internal_deleteGroup(req, res){
      const groupId = req.params.groupId
      return groupsServices.deleteGroup(req.userToken, groupId).then(
        removedGroup => {
          res.json({
            status: `Group id ${groupId} was deleted!`,
            group: removedGroup
          });
        })
    }

    function internal_updateGroup(req, res){
      const groupId = req.params.groupId
      return groupsServices.updateGroup(req.userToken, groupId, req.body).then(
        newGroup => {
          res.json({
            status: `Group id ${groupId} was updated!`,
            group: newGroup
          });
        })
    }

    function internal_addPlayerToGroup(req, res){
      const gropId = req.params.groupId
      const playerId = req.body.playerId
      return groupsServices.addPlayerToGroup(req.userToken, gropId, playerId).then(
        newPlayer => {
          res.status(201)
          res.json({
            status: `Added player to group id ${gropId}!`,
            player: newPlayer
          });
        })
    }  

    function internal_removePlayerFromGroup(req, res){
      const groupId = req.params.groupId
      const playerId = req.params.playerId
      return groupsServices.removePlayerFromGroup(req.userToken, groupId, playerId).then(
        group => {
          res.json({
            status: `Player ${playerId} from group id ${groupId} was removed!`,
            group: group
          });
      })
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