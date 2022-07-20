// Connect to socket IO server to exchange media and data

// Initialise all the variables
let isChannelReady = false;
let isStarted = false;
let localPeerConnection;
let dataChannel;
let isInitiator = false;
let localStream;
let remoteStream;

let mediaStreamConstraints = {
    audio : false,
    video : true,
};

let sdpConstraints = {
    offerToReceiveAudio : true,
    offerToReceiveVideo : true,
};

const offerOptions = {
    offerToReceiveVideo : 1
};

const localVideo = document.querySelector('#localVideo');
const remoteVideo = document.querySelector('#remoteVideo');
const dataChannelSend = document.querySelector('#dataChannelSend')
const dataChannelReceive = document.querySelector('#dataChannelReceive')
const sendButton = document.querySelector('#sendButton')


let room = prompt('Enter the room name: ');

let socket = io.connect();

if(room !== '') {
    socket.emit('create or join', room);
    console.log('Attempted to create or  join room', room);
}

//defining socket events

socket.on("connect" , () => {
    console.log("Connected to the socket");
});

socket.on("full", () => {
    console.log("The room is full");
});

socket.on("create", () => {
    console.log("Created room");
    isInitiator = true;
});

socket.on("joined", async (room) => {
    console.log("Peer connected to the room");
    isChannelReady = true;
});

socket.on("join", async (room) => {
    console.log("Joined the room");
    isChannelReady = true;
    try {
        await createRTCConnection();
    } catch (err) {
        console.log("Error with RTC Connection, ", err);
    }
} )

socket.on("message", async (message, room) => {
    console.log("Received a message from either the server or another peer", message.type);
    if(message.type === "offer") {
        if(!isStarted){
            try {
                await createRTCConnection();
            } catch (err) {
                console.log("Error with RTCcreateConnection");
            }
        }

        console.log("Created RTC Connection");
        try {
            await doAnswer(message);
        } catch (err) {
            console.log("issue with Answer creation");
        }

        
    } else if (message.type === "answer") {
        console.log("Got an answer from another peer");
        localPeerConnection.setRemoteDescription(new RTCSessionDescription(message));
    } else if(message.type === "icecandidate") {
        let candidate = new RTCIceCandidate({
            sdpMLineIndex : message.label,
            candidate : message.candidate
        });

        localPeerConnection.addIceCandidate(candidate)
    }
});

//Helper functions

// sendButton.addEventListener('click', sendDataChannel)

function sendMessage(message) {
    console.log("Sending a message to other peers", message.type);
    socket.emit("message", message, room);
}

async function createRTCConnection() {
    if(isChannelReady && !isStarted) {
        try {
            await getLocalMediaStream();
        } catch (err) {
            console.log("Got error while loading local media stream: ", err );
        }
        let server = null;
        localPeerConnection = new RTCPeerConnection(server);
        dataChannel = localPeerConnection.createDataChannel("test");
        localPeerConnection.addEventListener("datachannel", handleDataChannel);
        dataChannel.addEventListener('message', receiveData);
        localPeerConnection.addEventListener("icecandidate", handleConnection);
        localPeerConnection.addStream(localStream);
        // try {
        //     localPeerConnection.onaddstream = handleRemoteStreamAdded;
        // } catch (err) {
        //     console.log("Error while adding remote stream, ", err);
        // }
        localPeerConnection.onaddstream = handleRemoteStreamAdded;
        localPeerConnection.onremovestream = handleRemoteStreamRemoved;
        
        isStarted = true;
        console.log("Created RTC Peer Connection");
        sendButton.addEventListener('click', sendDataChannel)
        dataChannel.addEventListener('open', event => {
            dataChannelSend.disabled = false;
            dataChannelSend.focus();
            sendButton.disabled = false;
        });
        
        // Disable input when closed
        dataChannel.addEventListener('close', event => {
            dataChannelSend.disabled = true;
            sendButton.disabled = true;
        });
        if(isInitiator) {
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
        offer = await localPeerConnection.createOffer();

    } catch (err) {
        console.log("Error: ", err);
    }

    setDescription(offer);

}
async function doAnswer(message) {
    localPeerConnection.setRemoteDescription(new RTCSessionDescription(message));
    console.log("Sending answer to the other peer");
    let answer;
    try {
        answer = await localPeerConnection.createAnswer();
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
        console.log("Issue with IceCandidate/ No more Icecandidate left");
    }

}

function handleDataChannel(event) {
    console.log("Handling Data Channel")
    dataChannel = event.channel;
}

function sendDataChannel(event) {
    const message = dataChannelSend.value;
    console.log("Sending Data to Peer: ", message)
    dataChannel.send(message);
}

function receiveData(event) {
    const message = event.data;
    console.log("Received some data: ", message)
    //add message to the event box
    dataChannelReceive.textContent += message + '\n';

}

async function setDescription(description) {
    console.log("Offer from local peerconnection");
    try {
        await localPeerConnection.setLocalDescription(description);
    } catch (err) {
        console.log("Error with setting local description, ", err);
    }

    sendMessage(description)
}

async function getLocalMediaStream() {
    let mediastream;
    try {
        mediastream = await navigator.mediaDevices.getUserMedia(mediaStreamConstraints);
    } catch (err) {
        console.log("Error with getlocalmediastream: ", err);
    }
    localStream = mediastream;
    localVideo.srcObject = mediastream;
    console.log("Got local stream up and running", localStream, localVideo);
}

function handleRemoteStreamAdded(event) {
    try {
        remoteStream = event.stream;
        remoteVideo.srcObject = remoteStream;
    } catch {
        console.log("Issue with adding remote stream");
    }
    
    console.log("Got remote stream", remoteStream, remoteVideo);
}   

function handleRemoteStreamRemoved(event) {
    console.log('Remote stream removed. Event: ', event);
}

function stop() {
    isStarted = false;
    localPeerConnection.close();
    localPeerConnection = null;
}


