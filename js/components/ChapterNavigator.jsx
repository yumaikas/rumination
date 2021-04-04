import React, {useState, useEffect} from '../vendor/react';
import {bookLoader} from '../bibleLoader';

export function ChapterNavigator(props) {
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
            verses.forEach(function(v) {
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
            <div className="chapter-grid"> {bookData.chapter_info.map(function (c) {
                return (<span key={c.num}>
                    <a className="chapter-num-link larger" href={`#passage/${c.canon_order}/${c.canon_order}`}>{c.num}</a> 
                    </span>);
            })}
            </div>
        </div>);
    }
};
