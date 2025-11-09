var requestOptions = {
    method: `GET`,
    headers: {'X-Auth-Token': process.env.key}
}

export default function init() {
    const teams = {
      "EPL-2024": [
        {
          teamId: "T1",
          name: "Arsenal",
          country: "England",
          players: [
            { playerId: "P1", playerName: "Saka", position: "RW", nationality: "England", age: 22 },
            { playerId: "P2", playerName: "Odegaard", position: "CM", nationality: "Norway", age: 25 }
          ]
        },
        {
          teamId: "T2",
          name: "Manchester City",
          country: "England",
          players: [
            { playerId: "P3", playerName: "Haaland", position: "ST", nationality: "Norway", age: 23 },
            { playerId: "P4", playerName: "De Bruyne", position: "CM", nationality: "Belgium", age: 33 }
          ]
        }
      ],
      "UCL-2024": [
        {
          teamId: "T3",
          name: "Real Madrid",
          country: "Spain",
          players: [
            { playerId: "P5", playerName: "Vinicius Jr", position: "LW", nationality: "Brazil", age: 24 },
            { playerId: "P6", playerName: "Bellingham", position: "AM", nationality: "England", age: 21 }
          ]
        }
      ]
    };
  
    // Groups stored by: userToken -> { groupName -> groupObject }
    const groups = {};
  
    //
    // MOCK DATA INTERFACE (used by services)
    //
    return {
      getCompetitions,
      getTeams,
      getGroupsForUser,
      getGroup,
      addGroup,
      updateGroup,
      deleteGroup,
      addPlayerToGroup,
      removePlayerFromGroup,
      isValidGroup, // TIRAR ESTAS FUNÇÕES DAQUI E POR NOUTRO FICHEIRO (SERVICES)!!!
      isValidUpdate,
      isValidPlayer,
      isPlayerInGroup,
      isSquadFull
    };
  
  
    //
    // FUNCTIONS
    //
  /*
    function getCompetitions() {
      return [...competitions];
    }
      */
    async function getObjApi(options){
        try {
            // Returns the api's response if possible
            return (await fetch(`https://api.football-data.org/v4/${options}`, requestOptions)).json()
        }
        catch(error) {
            // Else, shows error
            processError(error)
        }
    }
    
    async function getCompetitions(){
        const comps = await getObjApi("competitions/")
        return comps
    }
  
    function getTeams(competitionCode, season) {
      const key = `${competitionCode}-${season}`;
      return teams[key] ? [...teams[key]] : [];
    }
  
    function getGroupsForUser(userToken) {
      if (!groups[userToken]) groups[userToken] = {};
      return Object.values(groups[userToken]);
    }
  
    function getGroup(userToken, groupName) {
      const userGroups = groups[userToken]
        if (!userGroups) return userGroups;
      
        return userGroups[groupName];
    }    
  
    function addGroup(userToken, groupData) {
      if (!groups[userToken]) groups[userToken] = {};
  
      const newGroup = {
        name: groupData.name.toUpperCase(),
        description: groupData.description,
        competition: groupData.competition,
        year: groupData.year,
        players: []
      };
  
      groups[userToken][newGroup.name] = newGroup;
      return newGroup;
    }
  
    function updateGroup(userToken, groupName, updatedData) {
      if (!groups[userToken]) groups[userToken] = {};
      const group = groups[userToken][groupName];
      
      // Atualizar campos
      group.description = updatedData.description ?? group.description;
    
      // Se o nome mudar, temos de atualizar a chave do dicionário
      if (updatedData.name && updatedData.name !== groupName) {
        const newName = updatedData.name.toUpperCase();
  
        // Remover da chave antiga
        delete groups[userToken][groupName];
  
        // Atualizar a propriedade
        group.name = newName;
      
        // Inserir com a nova chave
        groups[userToken][newName] = group;
      }
      
      return group;
    }
  
    function deleteGroup(userToken, groupName) {
      delete groups[userToken][groupName];
      return { ok: true };
    }
  
      // Adicionar player ao grupo
    function addPlayerToGroup(userToken, groupName, player) {
      if (!groups[userToken] || !groups[userToken][groupName.toUpperCase()]) {
        return { internalError: { code: "NOT_FOUND" } };
      }
  
      const group = groups[userToken][groupName.toUpperCase()];
  
      // Verifica limite de 11 jogadores
      if (group.players.length >= 11) {
        return { internalError: { code: "MAX_PLAYERS" } };
      }
  
      group.players.push({
        playerId: player.playerId,
        playerName: player.playerName,
        teamCode: player.teamCode,
        teamName: player.teamName,
        position: player.position, // opcional se quiseres
        nationality: player.nationality,
        age: player.age
      });
  
      return group;
    }
  
    function removePlayerFromGroup(userToken, groupName, playerId){
        
        if (!groups[userToken]) groups[userToken] = {};
  
        if (!groups[userToken][groupName]) {
          return { internalError: { code: "NOT_FOUND" } };
        }
        
        const player = groups[userToken][groupName].players.find(
          p => p.playerId === playerId
        )
        if (!player) {
          return { internalError: { code: "NOT_FOUND" } };
        }
  
        groups[userToken][groupName].players = groups[userToken][groupName].players.filter(
          p => p.playerId !== playerId
        );
        return { ok: true };
    }  
  
    function isValidGroup(group) {
    if (
        group && (typeof group === "object") && 
        (typeof group.name === "string") && (group.name.trim() !== "") &&
        (typeof group.description === "string") && (group.description.trim() !== "") &&
        group.competition && (typeof group.competition === "object") &&
        (typeof group.competition.code === "string") && (group.competition.code.trim() !== "") &&
        (typeof group.competition.name === "string") && (group.competition.name.trim() !== "") &&
        group.year && (typeof group.year === "number") && (!isNaN(Number(group.year)))
      ) return true
      else return false;
    }
  
    function isValidUpdate(update){
      const group = update
      if (
        group && (typeof group === "object") && 
        (typeof group.name === "string") && (group.name.trim() !== "") &&
        (typeof group.description === "string") && (group.description.trim() !== "")
      ) return true
      else return false
    }
  
    function isValidPlayer(pl){
      if(
        pl && (typeof pl === "object") &&
        (typeof pl.playerId === "string") && (pl.playerId !== "") &&
        (typeof pl.playerName === "string") && (pl.playerId !== "") &&
        (typeof pl.teamCode === "string") && (pl.playerId !== "") &&
        (typeof pl.teamName === "string") && (pl.playerId !== "")
      ) return true
      return false
    }
  
    function isPlayerInGroup(userToken, groupName, pl){
      const idx = groups[userToken][groupName].players.findIndex(
        el => el.playerId === pl
      )
      if (idx != -1){
        return true
      }
      return false
    }
  
    function isSquadFull(userToken, groupName){
      if (groups[userToken][groupName].players.length >= 11) return true
      else return false
    }

    function processError(error){
        console.error(error.message)
        process.exit(1)
    }
  }
  

  