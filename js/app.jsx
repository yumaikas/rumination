import React from './vendor/react';
import ReactDOM from './vendor/react.dom';
import {BibleApp} from './components/BibleApp';

function logErr(msg, err) {
    console.error(msg, err);
}

// TODO: Regiester service worker here.

ReactDOM.render(<BibleApp/>, document.getElementById("bible-app-id"));






