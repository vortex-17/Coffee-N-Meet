// Media Controls

import {media, mediaStreamConstraints} from "./misc.js"


async function getLocalMediaStream() {
    let mediastream;
    try {
        mediastream = await navigator.mediaDevices.getUserMedia(mediaStreamConstraints);
    } catch (err) {
        console.log("Error with getlocalmediastream: ", err);
    }
    media.localStream = mediastream;
    media.localVideo.srcObject = mediastream;
    console.log("Got local stream up and running", media.localStream, media.localVideo);
}

function handleRemoteStreamAdded(event) {
    try {
        media.remoteStream = event.stream;
        media.remoteVideo.srcObject = media.remoteStream;
    } catch {
        console.log("Issue with adding remote stream");
    }
    
    console.log("Got remote stream", media.remoteStream, media.remoteVideo);
}   

function handleRemoteStreamRemoved(event) {
    console.log('Remote stream removed. Event: ', event);
}


export {media, getLocalMediaStream, handleRemoteStreamAdded, handleRemoteStreamRemoved}