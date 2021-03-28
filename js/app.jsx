import minty from './minty';
import dale from './dale';
import React, { useState, useEffect } from './react.development.js';
import ReactDOM from './react.dom.js';
import {bookLoader, loadPassage, maxVerse} from './bibleLoader.js';
import localForage from './localforage';
var e = React.createElement;

function logErr(msg, err) {
    console.error(msg, err);
}

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

console.log(bookLoader);

function renderPassage(start, end, passageLoads) {
    // var toc = B.get(['book-table']);
    var book_range = genBookRange(start, end);

    function renderBookPart(b, verses) {
        var verse = load.data;
        var bLen = b.max - b.min;
        var startingVerseIdx = start - b.min;
        var endingVerseIdx = end > b.max ? bLen : end - b.min;

        for (var i = startingVerseIdx; i <= endingVerseIdx; i++) {
            load.data
        }
    }

    return dale.go(book_range, function(b) {
        var load = passageLoads.get(b.book);
        if (load.status === "success") {
            return renderBookPart(b, load.data);
        }
        if (load.status === "failed") {
            return renderBookLoadFailed(b, load);
        }
    });

    var elements = [];
}

function linkOfRange(start, end) {
    return `#passage/${start}/${end}`;
}

function Passage(props) {
    let start_num = props.start;
    let end_num = props.end; 
    localForage.setItem("passage.last.bookmark", {
        start: start_num,
        end: end_num,
    });
    let tableOfContents = props.tableOfContents;
    let [verses, setVerses] = useState(null);
    let tocMap = new Map();
    dale.go(tableOfContents, function(b) {
        tocMap.set(b.book, b);
    });
    function getBookFromToc(book_id) {
        return tocMap.get(book_id);
    }

    useEffect(() => {
        let mounted = true;

        loadPassage(tableOfContents, start_num, end_num, (verses) => {
            console.log("VERSES: ", verses);
            if (mounted) {
                setVerses(verses); 
            }
        });

        return () => {
            mounted = false;
        };
    }, [tableOfContents, start_num, end_num]);

    if (!verses) {
        return <h2>Loading Passage...</h2>;
    }
    let link_add_start = linkOfRange(Math.max(start_num - 1, 0), end_num);
    let link_pop_start = linkOfRange(Math.min(start_num + 1, end_num), end_num);
    let link_add_end = linkOfRange(start_num, Math.min(end_num + 1, maxVerse));
    let link_pop_end = linkOfRange(start_num, Math.max(end_num - 1, start_num));

    let curr_chapter = verses[0].chapter - 1;
    let curr_book = null;

    return (
        <>
        <a href={link_add_start}>Previous Verse</a>
        <span> </span>
        <a href={link_pop_start}>Hide Verse</a>
        {verses.map((v) => {
            var output = [];
            let book = getBookFromToc(v.book);
            if (curr_book !== v.book) {
                curr_book = v.book;
                output.push(<h2 key={book.book}> <a href={`#book/${book.book}` }> {book.long_name}</a></h2>)
            }
            if (curr_chapter !== v.chapter) {
                curr_chapter = v.chapter;
                output.push(<h3 key={book.book + "" + v.chapter}>{curr_chapter}</h3>);
            }
            return (<>{output}<span className="verse"><sup className="verseNum">{v.verse}</sup>{v.verseText}</span></>);
        })}

        <br/>
        <br/>
        <a href={link_add_end}>Next Verse</a>
        <span> </span>
        <a href={link_pop_end}>Hide Verse</a>
        </>
    );
}

function BookLink(props) {
    var book = props.book
    return <a href={"#book/" + book.book} className="larger" style={{display:"block"}}> {book.short_name}</a>;
};

function ChapterNavigator(props) {
    var book = props.book;
    let book_id = props.book.book;

    let [bookData, setBookData] = useState(null);

    useEffect(() => {
        let mounted = true;
        bookLoader(book_id, (book) => {
            console.log(book);
            var verses = book;
            var chapters = [];
            var curr_chapter = 0;
            dale.go(verses, function(v) {
                if (v.chapter != curr_chapter) {
                    chapters.push({
                        num: v.chapter,
                        canon_order: v.canon_order,
                    });
                    curr_chapter = v.chapter;
                }
            });

            if (mounted) {
                setBookData({book: book, chapter_info: chapters });
            }
        }, (err) => {
            console.error(err);
        });
    }, [book]);

    if (!bookData) {
        return  (
        <div>
            <h2><a href="#">{book.long_name}</a></h2>
            <h2>Loading book...</h2>
        </div>
        );
    } else {
        return (<div>
            <h2><a href="#">{book.long_name}</a></h2>
            <div className="chapter-grid"> {dale.go(bookData.chapter_info, function (c) {
                return (<span key={c.num}>
                    <a className="chapter-num-link larger" href={`#passage/${c.canon_order}/${c.canon_order}`}>{c.num}</a> 
                    </span>);
            })}
            </div>
        </div>);
    }
};

function About(props) {
    return (
        <details>
        <summary><span className="larger">About</span></summary>
        <h3>About Ruminator</h3>
        <p>
        Ruminator is designed to be a slow-paced approach to reading the Bible. 
        </p>
        <p>
        So often, people take on long reading plans that have them reading multiple chapters of the Bible in a given day. Ruminator suggests a slower, more meditative practice, adding in a verse at a time, and reading slowly, and reading things over again.
        </p>
        <p>
        This is why you can only move forward one verse at a time, so that you can spend time with each verse, and let it soak in. This is also why Ruminator keeps track of where you left off, so you can pick it up and put it down throughout the day, spending some dedicated time, and some less dedicated time.
        </p>
        <p>
        Ruminator uses the <a href="https://worldenglish.bible/">World English Bible.</a>
        </p>
        </details>
    );
}

function PickUp(props) {
}

function TopNavigator(props) { 
    var otBooks = props.otBooks, ntBooks = props.ntBooks;
    return (<div>
        <details> 
            <summary><span className="larger">Old Testament</span></summary>
            {otBooks.map((b) => <BookLink key={b.book} book={b}/>)}
        </details>
        <details> 
            <summary><span className="larger">New Testament</span></summary>
            {ntBooks.map((b) => <BookLink key={b.book} book={b}/>)}
        </details>
        </div>);
}

function loadTableOfContents(resolve, reject) {
    minty.ajax('GET', '/toc', {}, {}, function(err, data) {
        if (err) {
            reject(err);
        } else {
            resolve(data.body);
        }
    });
}

function BibleApp(props) {
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

    console.log(navigator);
    if (!navigator.bookTable) {
        return (<h2>Loading...</h2>);
    }
    if (navigator.location === "home") {
            var otBooks = dale.fil(navigator.bookTable, undefined, function (book) {
                if (book.book_num < 40) { return book; }
            });
            var ntBooks = dale.fil(navigator.bookTable, undefined, function(book) {
                if (book.book_num >= 40) { return book; }
            });

        return (<> 
            <h2>Ruminator Bible Reader</h2>
            <TopNavigator otBooks={otBooks} ntBooks={ntBooks} />
            <About/>
            { bookmark && <a className="larger" href={linkOfRange(bookmark.start, bookmark.end)}>Where you left off</a> }
            </>);
    }
    if (navigator.location === "book") {
        book = navigator.bookTable.find(b => b.book === navigator.book);
        console.log(book);
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

ReactDOM.render(<BibleApp/>, document.getElementById("bible-app-id"));

// TODO Regiester service worker here.





