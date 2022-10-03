// Media Controls

import {media, mediaStreamConstraints, peer} from "./misc.js"


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
    return media.remoteStream;
}   

function handleRemoteStreamRemoved(event) {
    console.log('Remote stream removed. Event: ', event);
}

async function shareScreen(){
    console.log("Sharing Screen");
    let displayMediaStream;
    let screentrack;
    try {
        displayMediaStream = await navigator.mediaDevices.getDisplayMedia();
    } catch (err) {
        console.log("Could not share screen" ,err);
    }

    console.log("Display media stream: ", displayMediaStream);
    screentrack = displayMediaStream.getTracks()[0];
    media.shareScreenStream = displayMediaStream;
    // peer.localPeerConnection.addStream(media.shareScreenStream);
    // peer.localPeerConnection.addTrack(screentrack, displayMediaStream);
    displayMediaStream.getTracks().forEach(track => peer.localPeerConnection.addTrack(track, displayMediaStream));
    media.shareScreen.srcObject = displayMediaStream;
    console.log("Senders : ", peer.localPeerConnection.getSenders());
    // if (screentrack) {
    //     console.log('replace camera track with screen track');
    //     replaceTrack(screentrack);
    // }
}

async function stopSharing() {
    media.shareScreen = null;
}

const replaceTrack = (newTrack) => {
    const sender = peer.localPeerConnection.getSenders().find(sender =>
      sender.track.kind === newTrack.kind 
    );
  
    if (!sender) {
      console.warn('failed to find sender');
  
      return;
    }
  
    sender.replaceTrack(newTrack);
  }


export {media, getLocalMediaStream, handleRemoteStreamAdded, handleRemoteStreamRemoved, shareScreen, stopSharing}