let peerConnection;
let isInitiator = false; 


const videosContainer = document.getElementById('videos-container');
const socket = io.connect(window.location.origin);
const newVideo = document.getElementById('video');





socket.on("offer", (id, description) => {
  if(!isInitiator == true){  
  peerConnection = new RTCPeerConnection();
  peerConnection
    .setRemoteDescription(description)
    .then(() => peerConnection.createAnswer())
    .then(sdp => peerConnection.setLocalDescription(sdp))
    .then(() => {
      
        socket.emit("answer", id, peerConnection.localDescription);
      
      
    });
    
  peerConnection.ontrack = event => {
    /*
    const newVideo = document.createElement('video');
    newVideo.setAttribute('playsinline', '');
    newVideo.setAttribute('autoplay', '');    
    newVideo.setAttribute('muted', '');
    newVideo.setAttribute('id','video');
    videosContainer.appendChild(newVideo);
    */
    
    newVideo.srcObject = event.streams[0];
    //console.log(isInitiator);
  
  };
  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      socket.emit("candidate", id, event.candidate);
    }
  };
}
});


socket.on("candidate", (id, candidate) => {
  if (!isInitiator && peerConnection ){
  peerConnection
    .addIceCandidate(new RTCIceCandidate(candidate))
    .catch(e => console.error(e));
  }
});

socket.on("connect", () => {
  
  socket.emit("watcher");
});

socket.on("broadcaster", () => {
  isInitiator = true;
  console.log(isInitiator);
  socket.emit("watcher");
  
  
});

window.onunload = window.onbeforeunload = () => {
  socket.close();
  peerConnection.close();
  
};
