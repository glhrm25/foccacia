import { errors } from '../../commons/internal-errors.js'
import { fetchElastic } from './fetch-elastic.js'

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
            return (await fetch(`https://api.football-data.org/v4/${options}`, requestOptions)).json()
                .then(res => {
                    if (res.errorCode || res.error)
                        return Promise.reject(errors.RESOURCE_NOT_AVAILABLE())
                    
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
                    return getObjApi("competitions/")
                        .then(res => {
                            const comps = res.competitions.map(cmp => ({name: cmp.name, code: cmp.code})) // Guarda apenas o nome e código de cada competição
                            const competitions = {competitions: comps}
                            return fetchElastic('POST', '/competitions/_doc/' + '?refresh=wait_for', competitions)
                                .then(() => competitions )
                        })
                }
                else 
                    return resp.hits.hits[0]._source // array with only one element
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

    function getTeams(competitionCode, season) {
        return fetchElastic('GET', '/teams/_doc/' + `${competitionCode}${season}`)
            .then(resp => {
                if (!resp.found){
                    return getObjApi(`competitions/${competitionCode}/teams?season=${season}`)
                        .then(res => {
                            const filteredTeams = res.teams.map(
                                t => ({
                                    name: t.name, 
                                    country: t.area.name, 
                                    squad: t.squad.map(p => ({playerId: p.id, name: p.name, position: p.position}))
                                })
                            )
                            const teams = {teams: filteredTeams}
                            return fetchElastic('PUT', '/teams/_doc/' + `${competitionCode}${season}/` + '?refresh=wait_for', teams)
                                .then(() => teams )
                        })
                }
                else
                    return resp._source
            })
    }

    function getPlayer(playerId, year) {
        return fetchElastic('GET', '/players/_doc/' + playerId)
            .then(resp => {
                if (!resp.found){
                    return getObjApi(`persons/${playerId}`)
                        .then(res => {
                            const playerObj = {
                                playerId: res.id,
                                playerName: res.name,
                                teamId: res.currentTeam.id,
                                teamName: res.currentTeam.name,
                                position: res.position,
                                nationality: res.nationality,
                                age: year - Number(res.dateOfBirth.split("-")[0])
                            }
                            return fetchElastic('PUT', '/players/_doc/' + `${playerId}/` + '?refresh=wait_for', playerObj)
                                .then(body => {
                                    return playerObj
                                })
                        })
                }
                else
                    return resp._source
            })
    }
}

function processError(error) {
    console.error(error.message)
    process.exit(1)
}
