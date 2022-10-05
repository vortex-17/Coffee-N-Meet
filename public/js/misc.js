// All the global variables declared over here

const rtc = {
    isInitiator : false,
    isChannelReady : false,
    isStarted : false,
    makingOffer:false,
}

const peer = {
    localPeerConnection : null,
    dataChannel : null,
    terminateChannel : null,
    socket : null,
    file : null,
    polite : true,
    room : '',
    negotiated : false,
    tracks : {},
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
    shareScreenStream : null,
    shareScreen : null,
    shareScreenBtn : null,
    stopShareBtn : null,
    remoteShareStream : null,
    remoteShareVideo : null
}

let mediaStreamConstraints = {
    audio : false,
    video : true,
};

function sendMessage(message) {
    console.log("Sending a message to other peers", message.type);
    peer.socket.emit("message", message, peer.room);
}

export {
    rtc,
    peer,
    media,
    mediaStreamConstraints,
    sendMessage
}