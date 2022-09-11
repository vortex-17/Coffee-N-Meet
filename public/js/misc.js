// All the global variables declared over here

const rtc = {
    isInitiator : false,
    isChannelReady : false,
    isStarted : false,
}

const peer = {
    localPeerConnection : null,
    dataChannel : null,
    terminateChannel : null,
    socket : null,
    file : null,
}

const media = {
    localStream : null,
    localVideo : null,
    remoteStream : null,
    remoteVideo : null,
    dataChannelSend : null,
    dataChannelReceive : null,
    sendButton : null,
    terminateButton : null,
    fileInput : null,
    shareButton : null,
    shareScreen : null,
    shareScreenBtn : null,
    stopShareBtn : null,
}

let mediaStreamConstraints = {
    audio : false,
    video : true,
};

function sendMessage(message) {
    console.log("Sending a message to other peers", message.type);
    peer.socket.emit("message", message, "foo");
}

export {
    rtc,
    peer,
    media,
    mediaStreamConstraints,
    sendMessage
}