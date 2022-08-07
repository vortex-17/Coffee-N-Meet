// Socket functions

import * as RTCCtrl from "./rtc_ctrl.js"
import {peer, rtc} from "./misc.js"

function connectedToSocket(){
    console.log("Connected to Socket");
}

function roomFull(){
    console.log("The Room is full");
}

function create(){
    console.log("The room is created");
    rtc.isInitiator = true;
}

async function join(){
    console.log("Joined the room");
    rtc.isChannelReady = true;
    try {
        await RTCCtrl.createRTCConnection()
    } catch (err) {
        console.log("Error with RTC Connection: ", err);
    }
}

async function message(message){
    console.log("Recevied a message from server or another peer: ", message);
    if(message.type === "offer") {
        if(!rtc.isStarted){
            try {
                await RTCCtrl.createRTCConnection();
            } catch (err) {
                console.log("Error with RTCcreateConnection");
            }
        }

        console.log("Created RTC Connection");
        try {
            await RTCCtrl.doAnswer(message);
        } catch (err) {
            console.log("issue with Answer creation");
        }

        
    } else if (message.type === "answer") {
        console.log("Got an answer from another peer");
        peer.localPeerConnection.setRemoteDescription(new RTCSessionDescription(message));
    } else if(message.type === "icecandidate") {
        let candidate = new RTCIceCandidate({
            sdpMLineIndex : message.label,
            candidate : message.candidate
        });

        peer.localPeerConnection.addIceCandidate(candidate)
    }
}

function sendMessage(message) {
    console.log("Sending a message to other peers", message.type);
    peer.socket.emit("message", message, room);
}

export {
    connectedToSocket,
    roomFull,
    create,
    join,
    message,
    sendMessage
}