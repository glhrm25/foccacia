import { errors } from '../../commons/internal-errors.js'

const URI_PREFIX='http://localhost:9200';

export function fetchElastic(method, path, body=undefined){
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    };

    return fetch(URI_PREFIX + path, options)
        .then(response => response.json())
        .catch(error => {
            console.error(error.message) // FIX ERROR
            return Promise.reject(errors.RESOURCE_NOT_AVAILABLE())
        })
}