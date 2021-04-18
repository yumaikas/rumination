import React, { useState, useEffect } from '../vendor/react';
import {bookLoader, loadPassage, linkOfRange, maxVerse} from '../bibleLoader.js';
import localForage from '../vendor/localforage.js';

export function Passage(props) {
    let start_num = props.start;
    let end_num = props.end; 
    localForage.setItem("passage.last.bookmark", {
        start: start_num,
        end: end_num,
    });
    let tableOfContents = props.tableOfContents;
    let [verses, setVerses] = useState(null);
    let tocMap = new Map();
    tableOfContents.forEach(function (b) {
        tocMap.set(b.book, b);
    });

    function getBookFromToc(book_id) {
        return tocMap.get(book_id);
    }

    useEffect(() => {
        let mounted = true;

        loadPassage(tableOfContents, start_num, end_num, (verses) => {
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
        <div className="passage">
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
            return (
                <React.Fragment key={v.canon_order}>
                    {output}<span className="verse"><sup className="verseNum">{v.verse}</sup>{v.verseText}</span>
                </React.Fragment>);
        })}
        </div>

        <br/>
        <br/>
        <a href={link_add_end}>Next Verse</a>
        <span> </span>
        <a href={link_pop_end}>Hide Verse</a>
        </>
    );
}
