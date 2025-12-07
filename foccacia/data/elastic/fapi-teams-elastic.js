import { errors } from '../../commons/internal-errors.js'
import { fetchElastic } from './fetch-elastic.js';

let requestOptions = {
    method: `GET`,
    headers: { 'X-Auth-Token': process.env.key }
}

export default function init() {
    // Interface
    return {
        getCompetitions,
        searchCompetitionByCode,
        getTeams,
        getPlayer
    };

    async function getObjApi(options) {
        try {
            // Returns the api's response if possible
            return (await fetch(`https://api.football-data.org/v4/${options}`, requestOptions)).json().then(res => {
                if (res.errorCode) {
                    throw errors.RESOURCE_NOT_AVAILABLE()
                }
                else return res
            })
        }
        catch (error) {
            // Else, shows error
            processError(error)
        }
    }

    function getCompetitions() {
        return fetchElastic('GET', '/competitions/_search')
            .then(resp => {
                if (resp.error) {
                    //console.error("Elastic error:", body.error.reason);
                    return getObjApi("competitions/").then(comps => {
                        return fetchElastic('POST', '/competitions/_doc' + '?refresh=wait_for', comps)
                            .then(body => {
                                return { id: body._id, ...comps }
                            })
                    })
                }
                else 
                    return resp.hits.hits[0]._source
            })
    }

    function searchCompetitionByCode(comps, querySearch) {
        return new Promise((resolve, reject) => {
            if (!querySearch) resolve(comps)
            const searchedComps = comps.filter(
                comp => comp.code == querySearch
            )
            resolve(searchedComps);
        });
    }

    async function getTeams(competitionCode, season) {
        return await getObjApi(`competitions/${competitionCode}/teams?season=${season}`)
    }

    // FIX BUG OF TRYING TO ACCESS API WITHOUT THE TOKEN
    function getPlayer(playerId, year) {
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

function processError(error) {
    console.error(error.message)
    process.exit(1)
}
