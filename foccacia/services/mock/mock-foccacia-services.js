// MOCK of foccacia services
// This is a simple implementation: to be refactored.

export default function initMockServices(dataLayer) {

    return {
      getCompetitions,
      getTeams,
      getAllGroups,
      getGroup,
      addGroup,
      updateGroup,
      deleteGroup,
      addPlayerToGroup,
      removePlayerFromGroup,
    };
  
    function getCompetitions() {
      return dataLayer.getCompetitions();
    }
  
    function getTeams(competitionCode, season) {
      return dataLayer.getTeams(competitionCode, season);
    }
  
    function getAllGroups(userToken) {
      return dataLayer.getGroupsForUser(userToken);
    }
  
    function getGroup(userToken, groupName) {
      return dataLayer.getGroup(userToken, groupName);
    }
  
    function addGroup(userToken, body) {
      return dataLayer.addGroup(userToken, body);
    }
  
    function deleteGroup(userToken, groupName) {
      return dataLayer.deleteGroup(userToken, groupName);
    }

    function updateGroup(userToken, groupName, body) {
      return dataLayer.updateGroup(userToken, groupName, body);
    }
    
    function addPlayerToGroup(userToken, groupName, body){
      return dataLayer.addPlayerToGroup(userToken, groupName, body)
    }

    function removePlayerFromGroup(userToken, groupName, playerId){
      return dataLayer.removePlayerFromGroup(userToken, groupName, playerId)
    }
  }
  