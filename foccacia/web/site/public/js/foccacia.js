console.log("foccacia.js carregado");

const groupsURI = "/site/groups/"

function fetchWebSite(uri, options, messages){
    fetch(uri, options)
        .then(response => {
            // Message in the alert window
            if (response.ok){
                alert(messages.ok);
            }
            else {
                alert(messages.error);
            }
            // Parser HTML text
            return response.text();
        })
        // Replaces HTML document with response
        .then(htmlText => document.documentElement.innerHTML = htmlText)
        .catch(err => {
            console.log("Fetch error:", err);
            alert(`Fetch error: ${err.message}`);
        });
}

function handleClickUpdate(groupId, groupName) {
    // Confirmation window
    if (! confirm(`Do you confirm updating ${groupName}?`)) return;
    // URI for the Web site server:
    const uriUpdate = groupsURI + `${groupId}`

    // Get the update form
    const form = document.getElementById('updateGroupForm');
    const formDataGroup = new FormData(form);
    // Prepare the body with form data
    const urlencodedForm = new URLSearchParams(formDataGroup);
    // Convert the body to an object
    const urlencodedObj = Object.fromEntries(urlencodedForm);

    const options = {
        method: 'PUT',
        body: urlencodedForm,
        credentials: 'same-origin' // necessário se a rota tiver autenticação
    };

    // Messages for the fetch function
    const messages = {
        ok: `Group '${groupName == urlencodedObj.name ? groupName : urlencodedObj.name}' was updated!`,
        error: `Group '${groupName}' was NOT updated!`
    }

    // Call the fetch web site
    fetchWebSite(uriUpdate, options, messages);
}

function handleClickDelete(groupId, groupName) {
    // Confirmation window
    if (! confirm(`Do you confirm deleting ${groupName}?`)) return;
    // URI for the Web site server:
    const uriUpdate = groupsURI + `${groupId}`

    const options = {
        method: 'DELETE',
        credentials: 'same-origin' // necessário se a rota tiver autenticação
    };

    // Messages for the fetch function
    const messages = {
        ok: `Group '${groupName}' was deleted!`,
        error: `Group '${groupName}' was NOT deleted!`
    }

    // Call the fetch web site
    fetchWebSite(uriUpdate, options, messages);
}

function handleClickDeletePlayer(groupId, groupName, playerId, playerName) {
    // Confirmation window
    if (! confirm(`Do you confirm removing ${playerName} from ${groupName}?`)) return;
    // URI for the Web site server:
    const uriUpdate = groupsURI + `${groupId}` + `/players/${playerId}`;

    const options = {
        method: 'DELETE',
        credentials: 'same-origin' // necessário se a rota tiver autenticação
    };

    // Messages for the fetch function
    const messages = {
        ok: `'${playerName}' was removed from '${groupName}'`,
        error: `'${playerName}' was NOT removed!`
    }

    // Call the fetch web site
    fetchWebSite(uriUpdate, options, messages);
}