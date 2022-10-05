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
    peer.polite = false;
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
    // console.log("Recevied a message from server or another peer: ", message);
    console.log("Message recevied: ", message.type);
    if(message.type === "offer") {
        // if(!rtc.isStarted){
        //     try {
        //         await RTCCtrl.createRTCConnection();
        //     } catch (err) {
        //         console.log("Error with RTCcreateConnection");
        //     }
        // }

        if(peer.localPeerConnection == null) {
            try {
                await RTCCtrl.createRTCConnection();
            } catch (err) {
                console.log("Error with RTCcreateConnection");
            }
        }

        const offerCollision = (message.type === "offer") && (rtc.makingOffer || peer.localPeerConnection.signalingState !== "stable");
        let ignoreOffer = !peer.polite && offerCollision;
        if (ignoreOffer) {
            return;
        }
        console.log("Created RTC Connection");
        if(!offerCollision){
            try {
                await RTCCtrl.doAnswer(message);
                peer.negotiated = true;
            } catch (err) {
                console.log("issue with Answer creation", err);
            }
        }
        
    } else if (message.type === "answer") {
        console.log("Got an answer from another peer");
        peer.localPeerConnection.setRemoteDescription(new RTCSessionDescription(message));
        peer.negotiated = true;
    } else if(message.type === "icecandidate") {
        let candidate = new RTCIceCandidate({
            sdpMLineIndex : message.label,
            candidate : message.candidate
        });

        peer.localPeerConnection.addIceCandidate(candidate);
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