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
      renderUpdatePage: processRequest(internal_renderUpdatePage),
      renderGroupFormPage: processRequest(internal_renderGroupFormPage),
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

    // Renders update page
    function internal_renderUpdatePage(req, res){
      return groupsServices.getGroup(req.userToken, req.params.groupId)
          .then(group => res.render("update-view", {group}) )
    }

    function internal_renderGroupFormPage(req, res) {
      return groupsServices.getCompetitions(req.query)
          .then(competition =>  res.render("groupForm-view", competition[0]) ) // "competition" is always an array with only one element 
    }

    function internal_getCompetitions(req, res){
      return groupsServices.getCompetitions(req.query)
          .then( competitions => res.render("competitions-view", {competitions}) )
    }

    function internal_getTeams(req, res){
      const userToken = req.userToken
      return groupsServices.getGroup(userToken, req.query.id)
        .then(group => {
            return groupsServices.getTeams(req.params.competitionCode, req.params.season, userToken)
              .then(teams => res.render("teams-view", {teams: teams, group: group}) )
        })
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
      const userToken = req.userToken
      return groupsServices.updateGroup(userToken, groupId, req.body)
          .then( updateGroup => res.redirect("/site/groups") )
    }

    function internal_addPlayerToGroup(req, res){
      const groupId = req.params.groupId
      const playerId = req.body.playerId
      return groupsServices.addPlayerToGroup(req.userToken, groupId, playerId)
          .then(newPlayer => {
            res.status(201)
            res.redirect(`/site/groups/${groupId}`)
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
      return req.user.token
    }
}