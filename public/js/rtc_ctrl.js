// WebRTC Controls

import * as mediaCtrl from './media_ctrl.js'
import {peer, rtc, media, sendMessage} from "./misc.js"

const MAXIMUM_MESSAGE_SIZE = 65535;
const END_OF_FILE_MESSAGE = 'EOF';

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
        peer.filechannel = peer.localPeerConnection.createDataChannel("file", {negotiated: true, id: 3});
        peer.dataChannel.addEventListener('message', receiveData);
        peer.terminateChannel.addEventListener('message', terminateReceive);
        peer.filechannel.addEventListener('message', fileReceive);
        peer.filechannel.binaryType = 'arraybuffer'
        peer.localPeerConnection.addEventListener("icecandidate", handleConnection);
        peer.localPeerConnection.addStream(media.localStream);
        peer.localPeerConnection.onaddstream = mediaCtrl.handleRemoteStreamAdded;
        peer.localPeerConnection.onremovestream = mediaCtrl.handleRemoteStreamRemoved;
        
        rtc.isStarted = true;
        console.log("Created RTC Peer Connection");
        media.sendButton.addEventListener('click', sendDataChannel)
        peer.dataChannel.addEventListener('open', event => {
            media.dataChannelSend.disabled = false;
            media.dataChannelSend.focus();
            media.sendButton.disabled = false;
        });

        media.fileInput.addEventListener("change", (event) => {
            peer.file = event.target.files[0];
            media.shareButton.disabled = !peer.file;
        });

        media.shareButton.addEventListener("click", (event) => {
            shareFile();
        });

        media.shareScreenBtn.addEventListener("click", async (event) => {
            await mediaCtrl.shareScreen();
        });

        media.stopShareBtn.addEventListener("click", (event) => {
            mediaCtrl.stopSharing();
        });

        // peer.filechannel.onopen = async () => {
            
        // }

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
    peer.socket.emit("terminate", "Bye");
    rtc.isInitiator = true;
    stop();
}

function terminateSession(event) {
    console.log("Terminating the channel");
    peer.terminateChannel.send("Bye");
    media.localStream = null;
    media.localVideo = null;
    peer.localPeerConnection.close();
    peer.localPeerConnection = null;
    media.remoteStream = null;
    media.remoteVideo = null;
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
    rtc.isStarted = false;
    // peer.localPeerConnection.close();
    // peer.localPeerConnection = null;
    // media.remoteStream = null;
    // media.remoteVideo = null;
}

async function shareFile() {
    console.log("Sharing file");
    if (peer.file) {
        const buff = await peer.file.arrayBuffer();
        for (let i = 0; i < buff.byteLength; i += MAXIMUM_MESSAGE_SIZE) {
            peer.filechannel.send(buff.slice(i, i + MAXIMUM_MESSAGE_SIZE));
        }
        peer.filechannel.send(END_OF_FILE_MESSAGE);
    }

    console.log("File Shared");
}

function fileReceive(event) {
    console.log("File Received");
    const { data } = event;
    const receivedBuffers = [];
    try {
      if (data !== END_OF_FILE_MESSAGE) {
        receivedBuffers.push(data);
    } else {
        const arrayBuffer = receivedBuffers.reduce((acc, arrayBuffer) => {
          const tmp = new Uint8Array(acc.byteLength + arrayBuffer.byteLength);
          tmp.set(new Uint8Array(acc), 0);
          tmp.set(new Uint8Array(arrayBuffer), acc.byteLength);
          return tmp;
        }, new Uint8Array());
        const blob = new Blob([arrayBuffer]);
        downloadFile(blob, "downloadable file");
        } 
    } catch (err) {
      console.log('File transfer failed: ', err);
    }
}

function downloadFile(blob, fileName) {
    const a = document.createElement('a');
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove()
}

export {
    createRTCConnection,
    doAnswer,
    createOffer,
    handleConnection,
    stop,
}