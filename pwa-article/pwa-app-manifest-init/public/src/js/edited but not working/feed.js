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

// Need to refer to the form
const form = document.querySelector('form');
const titleInput = document.querySelector('#title');
const locationInput = document.querySelector('#location');
const sharedMomentsArea = document.querySelector('#shared-moments');
const locationButton = document.querySelector('#location-btn');
const locationLoader = document.querySelector('#location-loader');
let fetchedLocation = {lat: 0, lng: 0};

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

form.addEventListener('submit', event => {
   event.preventDefault();
   if (titleInput.value.trim() === '' || locationInput.value.trim() === '' || !picture) {
       alert('Please enter valid data!');
       return;
   }
   closeCreatePostModal();
   const id = new Date().getTime();
   if ('serviceWorker' in navigator && 'SyncManager' in window) {
       navigator.serviceWorker.ready
       .then(sw => {
           const selfie = {
               id: id,
               title: titleInput.value,
               location: locationInput.value,
               selfie: picture,
           };
           writeData('sync-selfies', selfie)
           .then(() => sw.sync.register('sync-new-selfies'))
           .then(() => {
               const snackbarContainer = 
                     document.querySelector('#confirmation-toast');
               const data = {message: 'Your Selfie was saved for syncing!'};
               snackbarContainer.MaterialSnackbar.showSnackbar(data);
               readAllData('sync-selfies')
               .then(syncSelfies => {
                 updateUI(syncSelfies);
               })
           })
           .catch(function (err) {
               console.log(err);
           });
       });
   }
});

const createCard = selfie => {
  if (!selfie.selfie) return;
  const cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';

  const cardTitle = document.createElement('div');
  const blobUrl = URL.createObjectURL(selfie.selfie)
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url(' + blobUrl + ')';
  cardTitle.style.backgroundSize = 'cover';
  cardWrapper.appendChild(cardTitle);

  const cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.style.color = 'white';
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = selfie.title;
  cardTitle.appendChild(cardTitleTextElement);

  const cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = selfie.location;
  cardSupportingText.style.textAlign = 'center';
  cardWrapper.appendChild(cardSupportingText);

  // Material design lite stuff
  componentHandler.upgradeElement(cardWrapper);

  sharedMomentsArea.appendChild(cardWrapper);
};

const clearCards = () => {
  while (sharedMomentsArea.hasChildNodes()) {
      sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
};

const updateUI = selfies => {
  clearCards();
  selfies.forEach(selfie => createCard(selfie));
};