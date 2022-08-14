// Connect to socket IO server to exchange media and data

import * as mediaCtrl from './media_ctrl.js'
import * as socketCtrl from './socket_ctrl.js'
import {media, peer} from "./misc.js"

media.localVideo = document.querySelector('#localVideo');
media.remoteVideo = document.querySelector('#remoteVideo');
media.dataChannelSend = document.querySelector('#dataChannelSend')
media.dataChannelReceive = document.querySelector('#dataChannelReceive')
media.sendButton = document.querySelector('#sendButton')
media.terminateButton = document.querySelector('#terminateButton')

media.fileInput = document.querySelector("#file-input");
media.shareButton = document.querySelector("#share");


let room = prompt('Enter the room name: ');

peer.socket = io.connect();

if(room !== '') {
    peer.socket.emit('create or join', room);
    console.log('Attempted to create or  join room', room);
}

//defining socket events

peer.socket.on("connect" , socketCtrl.connectedToSocket);

peer.socket.on("full", socketCtrl.roomFull);

peer.socket.on("create", socketCtrl.create);

peer.socket.on("join", socketCtrl.join)

peer.socket.on("message", socketCtrl.message);

function sendMessage(message) {
    console.log("Sending a message to other peers", message.type);
    socket.emit("message", message, room);
}

