import React from './vendor/react';
import ReactDOM from './vendor/react.dom';
import {BibleApp} from './components/BibleApp';
import {installToLocalStorage} from './bibleLoader';

function logErr(msg, err) {
    console.error(msg, err);
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
            console.log("Registerd service worker with scope: ", registration);
        }).catch(function(err) {
            console.error("Unable to register service worker: ", err);
        });
    });
}

ReactDOM.render(<BibleApp/>, document.getElementById("bible-app-id"));

