var requestOptions = {
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
    const comps = await getObjApi("competitions/") 
    console.log(comps)
    return comps
}

async function getTeams(competitionCode, season){
    
}

function getPlayer(){

    }
}
function processError(error){
    console.error(error.message)
    process.exit(1)
}
