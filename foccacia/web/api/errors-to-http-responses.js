import { INTERNAL_ERROR_CODES } from '../../commons/internal-errors.js';

// Constructor function for an Http-response error object.
function HttpResponseError(status, e) {
    this.status = status;
    this.body = {
        code: e.internalError, // internal code error
        error: e.description
    };
}

// Input: an error object:
//      - Error {code: <numberValue>, description: <stringValue>}
// Output: an HTTP status response object:
//      - HttpResponse {
//          status: <numberValue>, 
//          body: {code: <numberValue>, description: <stringValue>}
//        }
export function errorToHttp(e) {
    switch(e.internalError) {
        case INTERNAL_ERROR_CODES.INVALID_GROUP: return new HttpResponseError(400, e);
        case INTERNAL_ERROR_CODES.INVALID_UPDATE: return new HttpResponseError(400, e);
        case INTERNAL_ERROR_CODES.INVALID_PLAYER: return new HttpResponseError(400, e);
        case INTERNAL_ERROR_CODES.INVALID_USER: return new HttpResponseError(400, e);
        case INTERNAL_ERROR_CODES.INVALID_QUERY: return new HttpResponseError(400, e);
        case INTERNAL_ERROR_CODES.INVALID_PARAMETER: return new HttpResponseError(400, e);
        case INTERNAL_ERROR_CODES.GROUP_NOT_FOUND: return new HttpResponseError(404, e);
        case INTERNAL_ERROR_CODES.USER_NOT_FOUND: return new HttpResponseError(404, e);
        case INTERNAL_ERROR_CODES.PLAYER_NOT_FOUND: return new HttpResponseError(404, e);
        case INTERNAL_ERROR_CODES.USER_ALREADY_EXISTS: return new HttpResponseError(400, e);
        case INTERNAL_ERROR_CODES.PLAYER_ALREADY_EXISTS: return new HttpResponseError(400, e);
        case INTERNAL_ERROR_CODES.GROUP_ALREADY_EXISTS: return new HttpResponseError(400, e);
        case INTERNAL_ERROR_CODES.MISSING_PARAMETER: return new HttpResponseError(400, e);
        case INTERNAL_ERROR_CODES.MISSING_TOKEN: return new HttpResponseError(401, e)
        case INTERNAL_ERROR_CODES.NOT_AUTHORIZED: return new HttpResponseError(401, e);
        case INTERNAL_ERROR_CODES.SQUAD_IS_FULL: return new HttpResponseError(400, e);
        default: return new HttpResponseError(500, {
                internalError: INTERNAL_ERROR_CODES.SERVER_ERROR,
                description: "Internal server error. Contact your professor!"
            });
    }
}