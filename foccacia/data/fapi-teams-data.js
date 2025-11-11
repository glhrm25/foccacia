let requestOptions = {
    method: `GET`,
    headers: {'X-Auth-Token': process.env.key}
}

export default function init(){
    // Interface
    return {
        getCompetitions,
        getTeams,
        getPlayer
    };

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
        return await getObjApi("competitions/")
    }
  
    async function getTeams(competitionCode, season){
        return await getObjApi(`competitions/${competitionCode}/teams?season=${season}`)
    }
    // TO-DO:
    async function getPlayer(playerId){
        return await getObjApi(``)
    }
}

function processError(error){
    console.error(error.message)
    process.exit(1)
}
