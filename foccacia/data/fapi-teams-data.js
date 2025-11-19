import { errors } from '../commons/internal-errors.js'

let requestOptions = {
    method: `GET`,
    headers: {'X-Auth-Token': process.env.key}
}

export default function init(){
    const PLAYERS_CACHE = []

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

    function getPlayer(playerId, year){
     return new Promise((resolve, reject) => {
        const player = PLAYERS_CACHE.find(pl => pl.playerId == playerId)
        if (player) return resolve(player)
        
        getObjApi(`persons/${playerId}`).then(pl => {
            const newObj = {
                playerId: pl.id, 
                playerName: pl.name, 
                teamId: pl.currentTeam.id,
                teamName: pl.currentTeam.name,
                position: pl.position,
                nationality: pl.nationality,
                age: year - Number(pl.dateOfBirth.split("-")[0])
            }
            PLAYERS_CACHE.push(newObj)
            resolve(newObj)
           //return newObj
        })
        .catch(error => {
            console.log(error)
            reject(errors.INVALID_PLAYER(playerId)) // WHAT TO DO IN CASE OF ERROR????
        })
        
     })
    }
}

function processError(error){
    console.error(error.message)
    process.exit(1)
}
