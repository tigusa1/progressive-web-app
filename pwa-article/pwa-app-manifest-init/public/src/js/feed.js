const shareImageButton = document.querySelector('#share-image-button');
const createPostArea = document.querySelector('#create-post');
const closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');

//const openCreatePostModal = () => createPostArea.style.transform = 'translateY(0)';
const openCreatePostModal = () => {
   setTimeout(() => createPostArea.style.transform = 'translateY(0)', 1);
   initializeMedia();
};
const closeCreatePostModal = () => createPostArea.style.transform = 'translateY(100vh)';

const videoPlayer = document.querySelector('#player');
const canvasElement = document.querySelector('#canvas'); 
const captureButton = document.querySelector('#capture-btn'); 
let picture;

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

const initializeMedia = () => {
   if (!('mediaDevices' in navigator)) {
       navigator.mediaDevices = {};
   }
   if (!('getUserMedia' in navigator.mediaDevices)) {
      navigator.mediaDevices.getUserMedia = (constraints) => {
          const getUserMedia = navigator.webkitGetUserMedia ||
                               navigator.mozGetUserMedia;
          if (!getUserMedia) {
              return Promise.reject(
                  new Error('getUserMedia is not implemented!')
              );
          };
          return new Promise((resolve, reject) =>
              getUserMedia.call(navigator, constraints, resolve, reject)
          );
       }; 
   };
   navigator.mediaDevices.getUserMedia({
       video: {facingMode: 'user'},
       audio: false
   })
   .then(stream => {
       videoPlayer.srcObject = stream;
       videoPlayer.style.display = 'block';
       videoPlayer.setAttribute('autoplay', '');
       videoPlayer.setAttribute('muted', '');
       videoPlayer.setAttribute('playsinline', '');
   })
   .catch(error => {
       console.log(error);
   });
};

shareImageButton.addEventListener('click', openCreatePostModal);

captureButton.addEventListener('click', event => {
   canvasElement.style.display = 'block'; 
   videoPlayer.style.display = 'none'; 
   captureButton.style.display = 'none';
   const context = canvasElement.getContext('2d'); 
   context.drawImage(
       videoPlayer, 0, 0, canvasElement.width,
       videoPlayer.videoHeight / (videoPlayer.videoWidth / canvasElement.width)
   );
   videoPlayer.srcObject.getVideoTracks().forEach(track => track.stop());
   picture = dataURItoBlob(canvasElement.toDataURL());
});