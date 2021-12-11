
window.loadtemplate = (template) => {
    document.getElementById('display_name').value = localStorage.getItem(template);
}
window.save = (id) => {
    if(document.getElementById(id).value == "") {
        localStorage.removeItem(id);
    } else {
        localStorage.setItem(id, document.getElementById(id).value);
    }
}
window.load = () => {
    let storage = window.localStorage;

    for(let i = 0; i < storage.length; i++) {
        let key = storage.key(i);
        document.getElementById(key).value = storage.getItem(key);
    }
}
window.toggleMem = () => {
    let apMemberElements = document.getElementsByClassName('apMember');
    if(document.getElementById('autoproxy_mode').value == 'member') {
        for(const apMemberElement of apMemberElements) {
            apMemberElement.removeAttribute('hidden');
        }
    } else {
        for(const apMemberElement of apMemberElements) {
            apMemberElement.setAttribute('hidden', '');
        }
    }
}
window.toggleDisplayName = () => {
    let templateLoadButtons = document.getElementsByClassName('templateLoadButton');
    if(document.getElementById('display_name_select').value == 'set') {
        document.getElementById('display_name').removeAttribute('hidden');
        for(const templateLoadButton of templateLoadButtons) {
            templateLoadButton.removeAttribute('hidden');
        }
    } else {
        document.getElementById('display_name').setAttribute('hidden', '');
        for(const templateLoadButton of templateLoadButtons) {
            templateLoadButton.setAttribute('hidden', '');
        }
    }
}
window.toggleAvatar = () => {
    if(document.getElementById('avatar_url_select').value == 'set') {
        document.getElementById('avatar_url').removeAttribute('hidden');
    } else {
        document.getElementById('avatar_url').setAttribute('hidden', '');
    }
}
window.lock = false;
window.wait = (time) => new Promise(res => setTimeout(res, time));
window.waitFetch = async (url, args) => {
    while (window.lock) await wait(1);
    window.lock = true;
    setTimeout(() => window.lock = false, 500);
    return fetch(url, args);
};
window.update = (text) => document.getElementById("content").innerHTML = text;
window.clearConsole = () => {
    document.getElementById('error').innerHTML = '';
    document.getElementById('content').innerHTML = '';
}
window.updateList = async (memberjson, member) => {
    let element = document.getElementById('staying_content');
    let str = element.innerHTML.substring(0,element.innerHTML.length-8) + `<tr><td>${member.name}</td><td>${member.id}</td><td>${memberjson.display_name ? memberjson.display_name : "<i>None set</i>"}</td><td>${memberjson.avatar_url ? memberjson.avatar_url : "<i>None set</i>"}</td></tr></table>`;
    element.innerHTML = str;
}
window.viewAll = () => window.viewAllInner().then(() => document.getElementById('content').innerHTML = 'Done!').catch(err => document.getElementById('error').innerHTML = err);
window.viewAllInner = async () => {
    window.clearConsole();
    document.getElementById('staying_content').innerHTML = `<table><tr><th>Member Name</th><th>Member ID</th><th>Servername</th><th>Serveravatar</th></tr></table>`;

    let token = document.getElementById('token').value;
    if(token.length == 0) {
        throw('Please enter a token');
    } else if(token.length != 64) {
        throw('Token is not a token (should be a 64-char long string1)');
    }
    console.log(`got token ${token}`);

    let server = document.getElementById('serverid').value;
    let serverid;
    if(server.length == 0) {
        throw('Please put a server');
    } else if(isNaN(server)) {
        let l = server.length;
        serverid = server.substring(l - (18 * 3) - 2, l - (18 * 2) - 2);
        if(isNaN(serverid)) {
        throw('not a valid server');
        }
    } else {
        serverid = server;
    }

    let members = await waitFetch(`https://api.pluralkit.me/v2/systems/@me/members`, {
        headers: { 'Authorization': token }
    });

    members = await members.json();

    for (let i = 0; i < members.length; i++ ) {
        let member = await waitFetch(`https://api.pluralkit.me/v2/members/${members[i].id}/guilds/${serverid}`, {
            method: 'GET',
            headers: {
                'Authorization': token,
                'content-type': 'application/json'
            }
        });

        let memberjson = await member.json();

        if(member.status == 200 || (member.status == 404 && (memberjson.code == 20010))) {
            await updateList(memberjson, members[i]);
        } else {
            throw(`Something went wrong, please report the following number to Petal in the support server with what you were trying to do: ${member.status}`);
        }

        console.log(`Fetched member ${members[i].name} (${members[i].id})`);
        update(`Remaining members: ${members.length - i}<br>Remaining time (estimate): ${members.length - i} seconds<br>Keep this page open!`);
    }

}
window.clearAll = () => window.clearAllInner().then(() => document.getElementById('content').innerHTML = 'Done!').catch(err => document.getElementById('error').innerHTML = err);
window.clearAllInner = async () => {
    window.clearConsole();

    let token = document.getElementById('token').value;
    if(token.length == 0) {
        throw('Please enter a token');
    } else if(token.length != 64) {
        throw('Token is not a token (should be a 64-char long string)');
    }
    console.log(`got token ${token}`);

    let server = document.getElementById('serverid').value;
    let serverid;
    if(server.length == 0) {
        throw('Please put a server');
    } else if(isNaN(server)) {
        let l = server.length;
        serverid = server.substring(l - (18 * 3) - 2, l - (18 * 2) - 2);
        if(isNaN(serverid)) {
            throw('not a valid server');
        }
    } else {
        serverid = server;
    }

    let members = await waitFetch(`https://api.pluralkit.me/v2/systems/@me/members`, {
        headers: { 'Authorization': token }
    });

    members = await members.json();

    for (let i = 0; i < members.length; i++ ) {
        let response = await waitFetch(`https://api.pluralkit.me/v2/members/${members[i].id}/guilds/${serverid}`, {
            method: 'PATCH',
            headers: {
                'Authorization': token,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                display_name: null,
                avatar_url: null
            })
        });

        if(response.status != 200) {
            throw(`Sorry, an error occured (${response.status})`);
        }

        console.log(`Cleared member ${members[i].name} (${members[i].id})`);
        update(`Remaining members: ${members.length - i}<br>Remaining time (estimate): ${members.length - i} seconds<br>Keep this page open!`);
    }

}
window.runSystem = () => window.runSystemInner().then(() => document.getElementById('content').innerHTML = 'Done!').catch(err => document.getElementById('error').innerHTML = err);
window.runSystemInner = async () => {
    window.clearConsole();
    let token = document.getElementById('token').value;
    if(token.length == 0) {
        throw('Please enter a token');
    } else if(token.length != 64) {
        throw('Token is not a token (should be a 64-char long string)');
    }
    console.log(`got token ${token}`);

    let server = document.getElementById('serverid').value;
    let serverid;
    if(isNaN(server)) {
        let l = server.length;
        serverid = server.substring(l - (18 * 3) - 2, l - (18 * 2) - 2);
        if(isNaN(serverid)) {
            throw('not a valid server');
        }
    } else {
        serverid = server;
    }

    let proxying_enabled = document.getElementById('proxying_enabled').value;
    let tag_enabled = document.getElementById('tag_enabled').value;
    let tag = document.getElementById('tag').value;
    let autoproxy_mode = document.getElementById('autoproxy_mode').value;
    let autoproxy_member = document.getElementById('autoproxy_member').value.toLowerCase();
    let tag_toggle = document.getElementById('tag_toggle').checked;

    let json = JSON.stringify({
        proxying_enabled: (proxying_enabled == 'true' ? true : proxying_enabled == 'false' ? false : undefined),
        tag_enabled: (tag_enabled == 'true' ? true : tag_enabled == 'false' ? false : undefined),
        tag: tag_toggle ? null : tag.length > 0 ? tag : undefined,
        autoproxy_mode: ((autoproxy_mode == 'null' || (autoproxy_mode == 'member' && autoproxy_member.length != 5)) ? undefined : autoproxy_mode),
        autoproxy_member: (autoproxy_mode == 'member' && autoproxy_member.length == 5) ? autoproxy_member : undefined
    });
    if(json.length == 2) {
        throw('You must change some settings');
    }

    let response = await waitFetch(`https://api.pluralkit.me/v2/systems/@me/guilds/${serverid}`, {
        method: 'PATCH',
        headers: {
            'Authorization': token,
            'content-type': 'application/json'
        },
        body: json
    });

    if(response.status != 200) {
        throw(`Sorry, an error occured (${response.status})`);
    }

    console.log('Patched!');
}
window.runMember = () => window.runMemberInner().then(() => document.getElementById('content').innerHTML = 'Done!').catch(err => document.getElementById('error').innerHTML = err);
window.runMemberInner = async () => {
    window.clearConsole();
    let token = document.getElementById('token').value;
    if(token.length == 0) {
        throw('Please enter a token');
    } else if(token.length != 64) {
        throw('Token is not a token (should be a 64-char long string)');
    }
    console.log(`got token ${token}`);

    let server = document.getElementById('serverid').value;
    let serverid;
    if(isNaN(server)) {
        let l = server.length;
        serverid = server.substring(l - (18 * 3) - 2, l - (18 * 2) - 2);
        if(isNaN(serverid)) {
            throw('not a valid server');
        }
    } else {
        serverid = server;
    }

    let member = document.getElementById('member').value.toLowerCase();
    if(member.length != 5) {
        throw('Invalid member id');
    }

    let display_name = document.getElementById('display_name').value;
    let avatar_url = document.getElementById('avatar_url').value;
    let display_name_select = document.getElementById('display_name_select').value;
    let avatar_url_select = document.getElementById('avatar_url_select').value;

    let json = JSON.stringify({
        display_name: (display_name_select == 'clear' ? null : (display_name_select == 'set' && display_name.length > 0) ? display_name : undefined),
        avatar_url: (avatar_url_select == 'clear' ? null : (avatar_url_select == 'set' && avatar_url.length > 0) ? avatar_url : undefined),
    });
    if(json.length == 2) {
        throw('You must change some settings');
    }

    let response = await waitFetch(`https://api.pluralkit.me/v2/members/${member}/guilds/${serverid}`, {
        method: 'PATCH',
        headers: {
            'Authorization': token,
            'content-type': 'application/json'
        },
        body: json
    });

    if(response.status != 200) {
        throw(`Sorry, an error occured (${response.status})`);
    }

    console.log('Patched!');
}
window.switchTo = (target) => {
    target == 'toSoloButton' ? document.getElementById('solo_settings').removeAttribute('hidden') : document.getElementById('solo_settings').setAttribute('hidden', '');
    target == 'toBulkButton' ? document.getElementById('bulk_settings').removeAttribute('hidden') : document.getElementById('bulk_settings').setAttribute('hidden', '');
    target == 'toTemplateButton' ? document.getElementById('templates').removeAttribute('hidden') : document.getElementById('templates').setAttribute('hidden', '');

    for(const b of document.getElementsByClassName('pageButton')) {
        if(b.id == target) {
            b.setAttribute('selected', true);
        } else {
            b.setAttribute('selected', false);
        }
    }
}
