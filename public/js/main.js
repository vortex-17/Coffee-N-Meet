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

socket.on("join", async (room) => {
    console.log("Peer connected to the room");
    isChannelReady = true;
});

socket.on("joined", async (room) => {
    console.log("Joined the room");
    isChannelReady = true;
} )

socket.on("message", async (message, room) => {
    console.log("Received a message from either the server or another peer");
    if(message.type === "offer") {

    } else if (message.type === "answer") {

    } else if(message.type === "candidate") {
        
    }
});

//Helper functions

function sendMessage(message) {
    console.log("Sending a message to other peers");
    socket.emit("message", message, room);
}



