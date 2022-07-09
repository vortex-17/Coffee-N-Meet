// Connect to socket IO server to exchange media and data

// Initialise all the variables
let isChannelReady = false;
let localPeerConnection;
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

let room = prompt('Enter the room name: ');

let socket = io.connect();

if(room !== '') {

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
        console.log("Error with RTC Connection");
    }
} )

socket.on("message", async (message, room) => {
    console.log("Received a message from either the server or another peer");
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
            await createAnswer(message);
        } catch (err) {
            console.log("issue with Answer creation");
        }

        
    } else if (message.type === "answer") {
        console.log("Got an answer from another peer");
        localPeerConnection.setRemoteDescription(new RTCSessionDescription(message));
    } else if(message.type === "candidate") {
        let candidate = new RTCIceCandidate({
            sdpMLineIndex : message.label,
            candidate : message.candidate
        });

        localPeerConnection.addIceCandidate(candidate)
    }
});

//Helper functions

function sendMessage(message) {
    console.log("Sending a message to other peers");
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
        localPeerConnection.addEventListener("icecandidate", handleConnection);
        localPeerConnection.addStream(localStream);
        localPeerConnection.onaddstream = handleRemoteStream;
        isStarted = true;
        console.log("Created RTC Peer Connection");
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
        offer = await localPeerConnection.createOffer(offerOptions);

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
        answer = localPeerConnection.createAnswer(offerOptions);
    } catch (err) {
        console.log("Error with creating answer: ", err);
    }

    setDescription(answer); 
}

function handleConnection(event) {
    console.log("ICE Candidate");
    const iceCandidate = event.candidate;
    if(iceCandidate) {
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

async function setDescription(description) {
    console.log("Offer from local peerconnection");
    try {
        await localPeerConnection.setDescription(description);
    } catch (err) {
        console.log("Error with setting local description, ", err);
    }
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
    console.log("Got local stream up and running");
}

async function handleRemoteStream(event) {
    remoteStream = event.stream;
    remoteVideo.srcObject = remoteStream;
    console.log("Got remote stream");
}   

function stop() {
    isStarted = false;
    localPeerConnection.close();
    localPeerConnection = null;
}

