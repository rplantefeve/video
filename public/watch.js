let peerConnection;
const videosContainer = document.getElementById("videos-container");

const statusElement = document.getElementById("status");

const socket = io.connect(window.location.origin);

socket.on("offer", (id, description) => {
  peerConnection = new RTCPeerConnection();

  peerConnection
    .setRemoteDescription(description)
    .then(() => peerConnection.createAnswer())
    .then((sdp) => peerConnection.setLocalDescription(sdp))
    .then(() => {
      socket.emit("answer", id, peerConnection.localDescription);
    });

  peerConnection.ontrack = (event) => {
    // Créez un nouvel élément vidéo pour chaque flux entrant
    const remoteVideo = document.createElement("video");
    remoteVideo.setAttribute("playsinline", "");
    remoteVideo.setAttribute("autoplay", "");

    // Ajoutez un bouton de lecture pour chaque vidéo
    const playButton = document.getElementById("play-pause-button");
    let isPlaying = false; // Variable pour suivre l'état de lecture

    playButton.addEventListener("click", () => {
      if (isPlaying) {
        remoteVideo.pause();
        isPlaying = false;
        playButton.textContent = "Lecture";
        statusElement.textContent = "Lecture en pause";
        
      } else {
        remoteVideo.play().catch((error) => console.error(error));
        isPlaying = true;
        playButton.textContent = "Pause";
        statusElement.textContent = "Lecture en cours";
      }
    });

    // Créez un conteneur pour chaque vidéo et son bouton de lecture
    const videoContainer = document.createElement("div");
    videoContainer.appendChild(remoteVideo);
    videosContainer.appendChild(videoContainer);

    // Affichez le flux vidéo entrant
    remoteVideo.srcObject = event.streams[0];
  };

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("candidate", id, event.candidate);
    }
  };
});

socket.on("candidate", (id, candidate) => {
  if (peerConnection) {
    peerConnection
      .addIceCandidate(new RTCIceCandidate(candidate))
      .catch((e) => console.error(e));
  }
});

socket.on("connect", () => {
  socket.emit("watcher");
});

socket.on("broadcaster", () => {
  socket.emit("watcher");
  // Une fois la connexion établie, activez le bouton
  const playPauseButton = document.getElementById("play-pause-button");
  playPauseButton.removeAttribute("disabled");
  statusElement.textContent = "Connexion établie.";
});

socket.on("disconnectPeer", () => {
  console.log("Déconnexion du diffuseur.");
  socket.close();
  peerConnection.close();
});

window.onunload = window.onbeforeunload = () => {
  socket.close();
  peerConnection.close();
};
