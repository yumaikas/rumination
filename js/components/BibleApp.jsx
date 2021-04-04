import React, { useState, useEffect } from '../vendor/react';
import ReactDOM from '../vendor/react.dom';
import {bookLoader, loadPassage, linkOfRange, maxVerse} from '../bibleLoader.js';
import {About} from './About';
import localForage from '../vendor/localforage';
import {Passage} from './Passage';
import {TestamentNavigator} from './TestamentNavigator';
import {ChapterNavigator} from './ChapterNavigator';

var loaded = false;
function useDispatchHash(setNav) {
    useEffect(() => {
        function dispatchHash () {
            if ((/#book\/\w+/).test(location.hash)){
                var book = location.hash.match(/#book\/(\w+)/)[1];
                setNav((nav) => ({...nav, ...{ location: "book", book: book }}));
                return;
            } 
            else if ((/#passage\/(\d+)\/(\d+)/).test(location.hash)) {
                var range = location.hash.match(/#passage\/(\d+)\/(\d+)/).slice(1, 3);
                setNav((nav) => ({...nav, ...{
                    location: "passage", 
                    start: parseInt(range[0], 10),
                    end:   parseInt(range[1], 10),}}));
                return;
            } else if (location.hash === "#") {
                setNav((nav) => ({...nav, ...{ location: "home" }}));
                return;
            } else if (location.hash === "") {
                setNav((nav) => ({...nav, ...{ location: "home" }}));
                return;
            }
            console.log(`Unhandled location hash ${location.hash}`);
        };
        if (!loaded) {
            loaded = true;
            dispatchHash();
        }

        window.addEventListener('hashchange', dispatchHash);
        return () => {
            window.removeEventListener('hashchange', dispatchHash);
        };
    });
}

function loadTableOfContents(resolve, reject) {
    fetch('/toc')
        .then(response => response.json())
        .then(data => {
            resolve(data);
        }).catch((error) => {
            reject(error);
        });
}

export function BibleApp(props) {
    const [navigator, setNavigator] = useState({ 
        bookTable: null,
        location: null,
    });

    const [err, setErr] = useState(null);
    const [bookmark, setBookmark] = useState(null);
    useEffect(() => {
        let mounted = true;
        localForage.getItem("passage.last.bookmark").then((data) =>{
            setBookmark(data);
        });
        return () => {
            mounted = false;
        };
    }, [navigator.start, navigator.end]);

    // Load the table of contents once on component load startup
    useEffect(() => {
        let mounted = true;
        loadTableOfContents((tocData) => {
            if (mounted) {
                setNavigator((nav) => {
                    return {...nav, ...{ location: nav.location || "home", bookTable: tocData}};
                });
            }
        }, (err) => {
            if (mounted) { setErr(err); }
        });

        return () => { mounted = false; };
    }, []);

    useDispatchHash(setNavigator);

    if (!navigator.bookTable) {
        return (<h2>Loading...</h2>);
    }
    if (navigator.location === "home") {
            var otBooks = navigator.bookTable.filter((book) => book.book_num < 40);
            var ntBooks = navigator.bookTable.filter((book) => book.book_num >= 40);

        return (<> 
            <h2>Ruminator Bible Reader</h2>
            <TestamentNavigator otBooks={otBooks} ntBooks={ntBooks} />
            <About/>
            { bookmark && <a className="larger" href={linkOfRange(bookmark.start, bookmark.end)}>Where you left off</a> }
            </>);
    }
    if (navigator.location === "book") {
        book = navigator.bookTable.find(b => b.book === navigator.book);
        return <ChapterNavigator book={book} />
    }
    if (navigator.location === "passage") {
        return (<Passage 
            start={navigator.start} 
            end={navigator.end} 
            tableOfContents={navigator.bookTable}/>);
    }
    return (<h2>This is an error!!!</h2>);
}
