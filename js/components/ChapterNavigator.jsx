import React, {useState, useEffect} from '../vendor/react';
import localForage from '../vendor/localforage';
import {bookLoader} from '../bibleLoader';

export function ChapterNavigator(props) {
    var book = props.book;
    let book_id = props.book.book;

    let [bookData, setBookData] = useState(null);
    let [mode, setMode] = useState("zen");

    useEffect(() => {
        let mounted = true;
        localForage.getItem("reading.mode").then((data) => {
            setMode(data);
        });
        bookLoader(book_id, (book) => {
            var verses = book;
            var chapters = [];
            var curr_chapter = 0;
            var max_verse = 0;
            verses.forEach(function(v) {
                max_verse = v.canon_order;
                if (v.chapter != curr_chapter) {
                    if (chapters.length > 0) {
                        chapters[chapters.length - 1].end_verse = v.canon_order - 1;
                    }
                    chapters.push({
                        num: v.chapter,
                        canon_order: v.canon_order,
                    });
                    curr_chapter = v.chapter;
                }
            });
            chapters[chapters.length - 1].end_verse = max_verse;

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
            <div className="chapter-grid"> {bookData.chapter_info.map(function (c) {
                let chapterLink = `#passage/${c.canon_order}/${c.canon_order}`;
                if (mode === "chapters") {
                    chapterLink = `#passage/${c.canon_order}/${c.end_verse}`;
                }
                return (<span key={c.num}>
                    <a className="chapter-num-link larger" href={chapterLink}>{c.num}</a> 
                    </span>);
            })}
            </div>
        </div>);
    }
};
