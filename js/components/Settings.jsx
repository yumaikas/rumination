import React, {useState, useEffect} from '../vendor/react';
import {installToLocalStorage, getInstallStatus} from '../bibleLoader.js';
import localForage from '../vendor/localforage';

export function Settings(props) {

    const [mode, setMode] = useState("zen");
    const [isInstalled, setIsInstalled] = useState("loading");

    useEffect(function() {
        getInstallStatus().then(amIInstalled => {
            if (amIInstalled) {
                setIsInstalled("true");
            } else {
                setIsInstalled("false");
            }
        }) 
    }, [])
    function changeMode(mode) {
        setMode(mode);
        localForage.setItem("reading.mode", mode);
    };

    function installBooks() {
        installToLocalStorage().then(() => {
            setIsInstalled("true");
        }).catch(err => {
            console.log(err);
            setIsInstalled("false");
        });
    }
    useEffect(() => {
        localForage.getItem("reading.mode").then((data) => {
            setMode(data || "zen");
        }).catch(err => {
            console.error(err);
        });
    }, []);

    let elem = null;
    let installElem = null;
    let underlineStyle = {textDecoration: "underline"};
    if (isInstalled === "loading") {
        installElem = (<h3>Loading Bible download status...</h3>);
    } else if (isInstalled === "true") {
        installElem = (<h3>All books of the Bible are downloaded!</h3>);
    } else if (isInstalled === "false") {
        installElem = (<h3><a style={underlineStyle} onClick={() => installBooks()}>Download Bible Books</a></h3>);
    }
    if (mode === "zen") {
        elem = (<h3><a style={underlineStyle} onClick={() => changeMode("chapters")}>Set Reading Mode to Chapters (currently zen)</a></h3>);
    } else {
        elem = (<h3><a style={underlineStyle} onClick={() => changeMode("zen")}>Set Reading Mode to Zen (currently chapters)</a></h3>);
    }
    return (
        <details>
            <summary><span className="larger">Settings</span></summary>
            {elem}
            {installElem}
        </details>
    );
};

