import minty from './minty.js';
import dale from './dale.js';
import localForage from `./localforage.js`

function logErr(msg, err) {
    console.error(msg, err);
}
// TODO: Make this not hardcoded, but maybe generate it at build time?
export var maxVerse = 31098;

export function bookLoader(book, resolve, reject) {
    function ajaxBook(book, resolve, reject) {
        minty.ajax('GET', '/book/' + book, {}, {}, function(err,data) {
            if (err) {
                reject(err);
            }
            localForage.setItem(book, data.body);
            resolve(data.body);
        });
    }
    /*
     * Check to see if we've loaded the book into IndxedDb already
     */
    localForage.getItem(book).then((bookData) => {
        if (bookData == null) {
            ajaxBook(book, resolve, reject);
            return;
        }
        resolve(bookData);
    });
};

export function getBookRange(toc, start, end) {
    var book_range = [];
    var scanning = false;

    dale.stop(toc, true, function(b) {
        if (b.min <= start && start <= b.max) {
            scanning = true;
        }
        if (b.min <= end && end <= b.max) {
            book_range.push(b);
            scanning = false;
            return true;
        }
        if (scanning) {
            book_range.push(b);
        }
    });
    return book_range;
}

export function loadPassage(toc, start, end, passageLoadCompleted) {
    var book_range = getBookRange(toc, start, end);
    console.log(toc, book_range);

    var book_loads = new Map();

    function loadError(book_id, err) {
        return {
            status: "error",
            book_id: book,
            error: err
        }
    }

    function loadBook(book) {
        console.log("Loading:", book.book);
        var retries = 3;
        var delay = 100;

        function bookLoaded(bookData) {
            book_loads.set(book, {
                status: "success",
                book_id: book,
                data: bookData
            });
            console.log(book_loads);
            if (book_loads.size == book_range.length) {

                // flatten the books into a single array, first
                var verses = [];
                dale.go(book_range, function(b) {
                    let load = book_loads.get(b);
                    if (load.status === "success") {
                        var bookVerses = book_loads.get(b).data;
                        verses = verses.concat(bookVerses.filter(v => { 
                            // console.log(start, end, v);
                            return start <= v.canon_order && v.canon_order <= end;
                        }));
                    }
                    if (load.status === "error") {
                        verses = verses.concat([{
                            verse: 0,
                            chapter: 0,
                            verseText: `Failed to load ${b}, check you internet connection?`,
                            canon_order: -1,
                        }]);
                    }
                });
                
                passageLoadCompleted(verses);
            }
        }

        // How many retries on loading a book?
        function retry(err) {
            if (retries > 0) {
                retries--;
                delay *= 1.75;
                setTimeout(function () { bookLoader(book, bookLoaded, retry) }, delay);
            } else {
                book_loads.set(book, loadError(book));
            }
        }
        bookLoader(book.book, bookLoaded, retry);
    }

    // Kick off all of the loads
    dale.go(book_range, function(b) { loadBook(b); })
}

 
