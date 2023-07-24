const rooms=[];

function generateRoomID() {
    var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var roomID = '';
    
    for (var i = 0; i < 4; i++) {
      var randomIndex = Math.floor(Math.random() * alphabet.length);
      roomID += alphabet.charAt(randomIndex);
    }
    
    return roomID;
}
  
function createRoom(){
    let roomId=generateRoomID();
    if(rooms.indexOf(roomId)!=-1){
        createRoom();
    }
    rooms.push(roomId);
    return roomId;
}

function exists(roomId){
    if(rooms.length>0 && rooms.indexOf(roomId)!=-1){
        return true;
    }
    else{
        return false;
    }
}

module.exports={createRoom, exists};
