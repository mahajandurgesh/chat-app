const users={};
const onlineUsers=[];
function setUser(username, nickname, socket){
    users[username]={username, nickname, socket};
    return users[username];
}

function getUser(username){
    return users[username];
}

function removeUser(username){
    var pos = onlineUsers.map(function(e){
        return e.username;
    }).indexOf(username);
    onlineUsers.splice(pos,1);
}

function checkUser(username){
    if(users[username]){
        return users[username].nickname;
    }
}

function userOnline(username){
    onlineUsers.push({username, nickname:users[username].nickname});
}

function getOnlineUsers(){
    return onlineUsers;
}

function updateSocket(username, socket){
    users[username].socket=socket;
}

module.exports={setUser, checkUser, getOnlineUsers, getUser, userOnline, removeUser, updateSocket};