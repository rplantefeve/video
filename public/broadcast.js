const peerConnections = {};


const socket = io.connect(window.location.origin);

socket.on("answer", (id, description) => {
  peerConnections[id].setRemoteDescription(description);
  console.log("socket reçoit answer broadcast");
});

socket.on("watcher", id => {
  const peerConnection = new RTCPeerConnection();
  peerConnections[id] = peerConnection;
  console.log("socket reçoit watcher broadcast");
  let stream = videoElement.srcObject;
  stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      socket.emit("candidate", id, event.candidate);
      console.log("socket envoie candidat broadcast");
    }
  };

  peerConnection
    .createOffer()
    .then(sdp => peerConnection.setLocalDescription(sdp))
    .then(() => {
      socket.emit("offer", id, peerConnection.localDescription);
      console.log("socket envoie offer broadcast");
    });
});

socket.on("candidate", (id, candidate) => {
  peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
  console.log("socket reçoit candidat broadcast");
});

socket.on("disconnectPeer", id => {
  peerConnections[id].close();
  delete peerConnections[id];
});

window.onunload = window.onbeforeunload = () => {
  socket.close();
};


const videoElement = document.querySelector("video");
const bouton = document.querySelector("button");



bouton.addEventListener('click',getStream);


function getDevices() {
  return navigator.mediaDevices.enumerateDevices();
}

function getStream() {
  if (window.stream) {
    window.stream.getTracks().forEach(track => {
      track.stop();
    });
  }
  
  return navigator.mediaDevices
    .getDisplayMedia()
    .then(gotStream)
    .catch(handleError);
}

function gotStream(stream) {
  window.stream = stream;
 
  videoElement.srcObject = stream;
  socket.emit("broadcaster");
  console.log("socket envoie broadcast");
}

function handleError(error) {
  console.error("Error: ", error);
}