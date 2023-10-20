const peerConnections = {};

const socket = io.connect(window.location.origin);

socket.on("answer", (id, description) => {
  peerConnections[id].setRemoteDescription(description);
  console.log("socket reçoit answer broadcast");
});

socket.on("watcher", (id) => {
  const peerConnection = new RTCPeerConnection();
  peerConnections[id] = peerConnection;
  console.log("socket reçoit watcher broadcast");

  let stream = videoElement.srcObject;
  stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("candidate", id, event.candidate);
      console.log("socket envoie candidat broadcast");
    }
  };

  peerConnection
    .createOffer()
    .then((sdp) => peerConnection.setLocalDescription(sdp))
    .then(() => {
      socket.emit("offer", id, peerConnection.localDescription);
      console.log("socket envoie offer broadcast");
    })
    .catch((error) => {
      console.error("Erreur lors de la création de l'offre : ", error);
    });
});

socket.on("candidate", (id, candidate) => {
  peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
  console.log("socket reçoit candidat broadcast");
});

socket.on("disconnectPeer", (id) => {
  peerConnections[id].close();
  delete peerConnections[id];
});

window.onunload = window.onbeforeunload = () => {
  socket.close();
};

const videoElement = document.querySelector("video");
const bouton = document.querySelector("#bouton");
const statusElement = document.querySelector("#status");
const errorMessageElement = document.querySelector("#error-message");

// Ajoutez un gestionnaire d'événements pour le bouton de démarrage
bouton.addEventListener("click", () => {
  if (window.stream) {
    // Arrêtez la diffusion si elle est déjà en cours
    stopStream();
  } else {
    // Démarrez la diffusion si elle n'est pas en cours
    startStream();
  }
});

function getDevices() {
  return navigator.mediaDevices.enumerateDevices();
}

function getStream() {
  if (window.stream) {
    window.stream.getTracks().forEach((track) => {
      track.stop();
    });
  }

  return navigator.mediaDevices
    .getDisplayMedia()
    .then(gotStream)
    .catch(handleError);
}

function startStream() {
  getStream()
    .then(() => {
      updateStatus("Diffusion en cours");
      bouton.textContent = "Arrêter la diffusion";
    })
    .catch(handleError); // Gestion de l'erreur ici
}

function stopStream() {
  if (window.stream) {
    window.stream.getTracks().forEach((track) => {
      track.stop();
    });
    updateStatus("Attente");
    bouton.textContent = "Démarrer la diffusion";
  }
}

function gotStream(stream) {
  window.stream = stream;

  videoElement.srcObject = stream;
  socket.emit("broadcaster");
  console.log("socket envoie broadcast");
}

// Fonction générique de gestion d'erreurs
function handleError(error) {
  console.error("Erreur : ", error);
  showError("Erreur : " + error.message);
}

// Fonction pour mettre à jour l'état de la diffusion
function updateStatus(status) {
  statusElement.textContent = "État : " + status;
}

// Fonction pour afficher un message d'erreur
function showError(message) {
  errorMessageElement.textContent = message;
}
