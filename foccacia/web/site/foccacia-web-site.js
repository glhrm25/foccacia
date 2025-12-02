//import * as tasksServices from "../../services/tasks-services.mjs";
import { errorToHttp  } from "../errors-to-http-responses.js";
import { errors } from "../../commons/internal-errors.js";

// Input: the Response Object and the internal error object to be set.
function setHttpError(res, err){
  const responseError = errorToHttp(err);
  res.status(responseError.status);
  return res.render("errors-view", responseError.body);
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
      renderHomePage: processRequest(internal_renderHomePage),
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

    function internal_renderHomePage(req, res){
      return new Promise ((resolve, reject) => {
        res.render("home-view")
      })
    }

    async function internal_getCompetitions(req, res){
      return groupsServices.getCompetitions(req.userToken)
          .then( competitions => res.render("competitions-view", {competitions}) )
    }

    async function internal_getTeams(req, res){
      const output = await groupsServices.getTeams(req.params.competitionCode, req.params.season, req.userToken);
      if (output.internalError) return output;
      console.log(output)
      // Success case
      res.render("teams-view", {teams: output});
    }

    function internal_getAllGroups(req, res){
      return groupsServices.getAllGroups(req.userToken, req.query)
            .then( groups => res.render("groups-view", {groups}) )
    }

    function internal_getGroup(req, res){
      return groupsServices.getGroup(req.userToken, req.params.groupId)
        .then( group => res.render("group-view", {group}))
    }

    function internal_addGroup(req, res){
      return groupsServices.addGroup(req.userToken, req.body)
        .then(group => {
          res.status(201)
          return res.redirect("/site/groups")
        })
    }

    function internal_deleteGroup(req, res){
      const groupId = req.params.groupId
      return groupsServices.deleteGroup(req.userToken, groupId)
          .then( removedGroup => res.redirect("/site/groups") )
    }

    function internal_updateGroup(req, res){
      const groupId = req.params.groupId
      return groupsServices.updateGroup(req.userToken, groupId, req.body)
          .then( updateGroup => res.redirect("/site/groups") )
    }

    function internal_addPlayerToGroup(req, res){
      const groupId = req.params.groupId
      const playerId = req.body.playerId
      return groupsServices.addPlayerToGroup(req.userToken, groupId, playerId)
          .then(newPlayer => {
            res.status(201)
            return res.redirect(`/site/groups/${groupId}`)
          })
    }  

    function internal_removePlayerFromGroup(req, res){
      const groupId = req.params.groupId
      const playerId = req.params.playerId
      return groupsServices.removePlayerFromGroup(req.userToken, groupId, playerId)
          .then( group => res.redirect(`/site/groups/${groupId}`) )
    }

    // Auxiliary module function
  function getToken(req) {
    // TODO: add Web site authentication (after, in the last classes)
    return "b0506867-77c3-4142-9437-1f627deebd67"; // asilva in mock Memory
  }
}