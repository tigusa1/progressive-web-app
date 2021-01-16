window.addEventListener('load', () => {
    const base = document.querySelector('base');
    console.log('base: ', base);
    let baseUrl = base && base.href || '';
    console.log('baseUrl: ', baseUrl);
    if (!baseUrl.endsWith('/')) {
        baseUrl = `${baseUrl}/`;
    };
    console.log('baseUrl: ', baseUrl);
    console.log('navigator: ', navigator);
    
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register(`${baseUrl}sw.js`)
            .then( registration => {
            // registration was successful
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
            console.log('register address: ',`${baseUrl}sw.js`);
        })
        .catch( err => {
            // registration failed
            console.log('ServiceWorder registration failed: ', err);
        })
    };
    
    console.log('finished checking serviceWorker');
});

