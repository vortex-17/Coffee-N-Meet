// WebRTC Controls

import * as mediaCtrl from './media_ctrl.js'
import {peer, rtc, media, sendMessage} from "./misc.js"

// const rtc = {
//     isInitiator : false,
//     isChannelReady : false,
// }

// const peer = {
//     localPeerConnection : null,
//     dataChannel : null,
//     terminateChannel : null,
// }

async function createRTCConnection() {
    if(true) { ///rtc.isChannelReady && !rtc.isStarted
        try {
            await mediaCtrl.getLocalMediaStream();
        } catch (err) {
            console.log("Got error while loading local media stream: ", err );
        }
        console.log("Creating Peer Connection");
        let server = null;
        peer.localPeerConnection = new RTCPeerConnection(server);
        console.log("Local Connection: ", peer.localPeerConnection);
        peer.dataChannel = peer.localPeerConnection.createDataChannel("test", {negotiated: true, id: 1});
        peer.terminateChannel = peer.localPeerConnection.createDataChannel("terminate", {negotiated: true, id: 2});
        console.log(1);
        peer.dataChannel.addEventListener('message', receiveData);
        console.log(2);
        peer.terminateChannel.addEventListener('message', terminateReceive);
        console.log(3);
        peer.localPeerConnection.addEventListener("icecandidate", handleConnection);
        console.log(4);
        peer.localPeerConnection.addStream(media.localStream);
        console.log(5);
        peer.localPeerConnection.onaddstream = mediaCtrl.handleRemoteStreamAdded;
        console.log(6);
        peer.localPeerConnection.onremovestream = mediaCtrl.handleRemoteStreamRemoved;
        console.log(7);
        
        rtc.isStarted = true;
        console.log("Created RTC Peer Connection");
        media.sendButton.addEventListener('click', sendDataChannel)
        peer.dataChannel.addEventListener('open', event => {
            media.dataChannelSend.disabled = false;
            media.dataChannelSend.focus();
            media.sendButton.disabled = false;
        });

        media.terminateButton.addEventListener('click', terminateSession)


        
        // Disable input when closed
        peer.dataChannel.addEventListener('close', event => {
            media.dataChannelSend.disabled = true;
            media.sendButton.disabled = true;
        });
        console.log("Peer Created");
        if(rtc.isInitiator) {
            createOffer();
        } else {
            console.log("Waiting for Offer");
        }

    } else {
        console.log("Waiting for users to join the meet room");
    }

}

async function createOffer() {
    console.log("Creating offer and sending to the other peer");
    let offer;
    try {
        offer = await peer.localPeerConnection.createOffer();

    } catch (err) {
        console.log("Error: ", err);
    }

    setDescription(offer);

}
async function doAnswer(message) {
    peer.localPeerConnection.setRemoteDescription(new RTCSessionDescription(message));
    console.log("Sending answer to the other peer");
    let answer;
    try {
        answer = await peer.localPeerConnection.createAnswer();
    } catch (err) {
        console.log("Error with creating answer: ", err);
    }

    setDescription(answer); 
}

function handleConnection(event) {
    console.log("ICE Candidate");
    const iceCandidate = event.candidate;
    if(event.candidate) {
        let message = {
            type : 'icecandidate',
            label: event.candidate.sdpMLineIndex,
            id: event.candidate.sdpMid,
            candidate: event.candidate.candidate
        };
        sendMessage(message);
    } else {
        console.log("No more Icecandidate left.");
    }

}

// function handleDataChannel(event) {
//     console.log("Handling Data Channel")
//     peer.dataChannel = event.channel;
// }

// function handleEndChannel(event) {
//     console.log("Handling end channel");
//     peer.terminateChannel = event.channel;
// }

function sendDataChannel(event) {
    const message = media.dataChannelSend.value;
    console.log("Sending Data to Peer: ", message)
    peer.dataChannel.send(message);
}

function receiveData(event) {
    const message = event.data;
    console.log("Received some data: ", message)
    //add message to the event box
    media.dataChannelReceive.textContent += message + '\n';

}

function terminateReceive(event) {
    const message = event.data;
    console.log("Received End of Session");
    peer.socket.emit("terminate", "Bye")
    rtc.isInitiator = true;
    stop();
}

function terminateSession(event) {
    console.log("Terminating the channel")
    peer.terminateChannel.send("Bye")
}

async function setDescription(description) {
    console.log("Offer from local peerconnection");
    try {
        await peer.localPeerConnection.setLocalDescription(description);
    } catch (err) {
        console.log("Error with setting local description, ", err);
    }

    sendMessage(description)
}

function stop() {
    isStarted = false;
    localPeerConnection.close();
    localPeerConnection = null;
}

export {
    createRTCConnection,
    doAnswer,
    createOffer,
    handleConnection,
    stop,
}