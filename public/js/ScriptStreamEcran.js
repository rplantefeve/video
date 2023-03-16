document.querySelector('#start-stream').addEventListener('click',async function captureScreen() {
    try {
        const stream = await navigator.mediaDevices.getDisplayMedia();
        const video = document.querySelector('#video-stream');
        video.srcObject = stream;
        document.body.appendChild(video);
        video.play();
    } catch(err) {
        console.error(err);
    }
})
/*
const socket = io("/");

socket.emit('join-room', ROOM_ID, 1);

socket.on('user-connected', userId => {
  console.log(userId);
});
*/
