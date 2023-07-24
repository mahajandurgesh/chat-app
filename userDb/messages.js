const messages = {};

function sendMessage(from, to, content){
    if(messages[to]){
        if(messages[to][from]){
            messages[to][from].push({from, to, content});
        }
        else{
            messages[to][from]=[{from, to, content}];
        }
    }
    else{
        messages[to]={};
        messages[to][from]=[{from, to, content}];
    }
    if(messages[from]){
        if(messages[from][to]){
            messages[from][to].push({from, to, content});
        }
        else{
            messages[from][to]=[{from, to, content}];
        }
    }
    else{
        messages[from]={};
        messages[from][to]=[{from, to, content}];
    }
}

function getChatsBetween(personOne, personTwo){
    if(messages[personOne] && messages[personOne][personTwo]){
        return messages[personOne][personTwo];
    }
    else{
        return [];
    }
}


module.exports={sendMessage, getChatsBetween};