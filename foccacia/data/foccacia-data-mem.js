export default function init() {
    const GROUPS = [];
  
    function Group(userId, name, description, competition, year){
      Group.counter = Group.counter === undefined ? 
                     GROUPS.length + 1 : Group.counter + 1;
      this.id = Group.counter;
      this.name = name;
      this.description = description;
      this.competition = competition
      this.year = year
      this.players = []
      this.userId = userId
    }

    return {
      getGroupsForUser,
      getGroup,
      searchGroups,
      addGroup,
      updateGroup,
      deleteGroup,
      addPlayerToGroup,
      removePlayerFromGroup
    };
    
    function getGroupsForUser(userId) {
      return new Promise((resolve, reject) => {
        const userGroups = GROUPS.filter(group => group.userId == userId)
        resolve(userGroups)
      })
    }
  
    function getGroup(userId, groupId) {
      return new Promise((resolve, reject) => {
        const group = GROUPS.find(
          group => group.id == groupId && group.userId == userId
        )
        resolve(group)
      })
    }
    
    function searchGroups(groups, querySearch) {
      return new Promise((resolve, reject) => { 
        if (! querySearch) resolve(groups)
        const searchedTasks = groups.filter(
          group => (group.name.includes(querySearch) || 
                    group.description.includes(querySearch)
                    //group.competition.includes(querySearch) || 
                    //group.year.includes(querySearch)
                  )
        )
        resolve(searchedTasks);
      });
    }
  
    function addGroup(userId, newGroup) {
      return new Promise((resolve, reject) => {
        const group = new Group(userId, newGroup.name, newGroup.description, newGroup.competition, newGroup.year);
        GROUPS.push(group)
        resolve(group);
      })
    }
  
    function updateGroup(userId, groupId, updatedData) {
      return new Promise((resolve, reject) => {
        const groupIndex = GROUPS.findIndex(
          group => (group.id == groupId && group.userId == userId)
        )
        GROUPS[groupIndex].name = updatedData.name
        GROUPS[groupIndex].description = updatedData.description
        resolve(GROUPS[groupIndex])
     })
    }
  
    function deleteGroup(userId, groupId) {
      return new Promise((resolve, reject) => {
        const idx = GROUPS.findIndex(
          g => g.userId == userId && g.id == groupId
        )
        const group = GROUPS[idx]
        GROUPS.splice(idx, 1)
        resolve(group)
      })
    }
  
   function addPlayerToGroup(userId, groupId, player) {
      return new Promise((resolve, reject) => {
        const idx = GROUPS.findIndex(
          g => g.userId == userId && g.id == groupId
        )
        const obj = {playerId: player.playerId, playerName: player.playerName, teamId: player.teamId, teamName: player.teamName}
        GROUPS[idx].players.push(obj)
        resolve(obj)
      })
    }

    function removePlayerFromGroup(userId, groupId, playerId){
      return new Promise((resolve, reject) => {
        const groupIdx = GROUPS.findIndex(
          g => g.userId == userId && g.id == groupId
        )
        const playerIdx = GROUPS[groupIdx].players.findIndex(
          p => p.playerId == playerId
        )
        GROUPS[groupIdx].players.splice(playerIdx, 1)
        resolve(GROUPS[groupIdx])
      })
    }  
} 