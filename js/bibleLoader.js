import localForage from `./vendor/localforage.js`

function logErr(msg, err) {
    console.error(msg, err);
}
// TODO: Make this not hardcoded, but maybe generate it at build time?
export var maxVerse = 31098;

let bookStatuses = null;

localForage.getItem("loaded.books").then((books) => {
    bookStatuses = books || {};
});

export function linkOfRange(start, end) {
    return `#passage/${start}/${end}`;
}

export function bookLoader(book, resolve, reject) {
    function checkBooks() {
        console.log("Checking", book);
        if (bookStatuses === null) {
            setTimeout(checkBooks, 10);
        } else {
            bookStatuses[book] = true;
            localForage.setItem("loaded.books", bookStatuses);
        }
    }
    function ajaxBook(book, resolve, reject) {
        fetch('/book/' + book)
            .then((resp) => resp.json())
            .then(data => {
                localForage.setItem(book, data);
                checkBooks();
                resolve(data);
            })
            .catch((error) => reject(error));
    }
    /*
     * Check to see if we've loaded the book into IndxedDb already
     */
    localForage.getItem(book).then((bookData) => {
        if (bookData === null) {
            ajaxBook(book, resolve, reject);
            checkBooks();
            return;
        } else {
            checkBooks();
        }
        resolve(bookData);
    });
};

export function getBookRange(toc, start, end) {
    var book_range = [];
    var scanning = false;

    // Scan until we find the end of the range.
    toc.find(function(b) {
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

export function getInstallStatus(callback) {
    return new Promise((resolve, reject) => {
        localForage.getItem("loaded.books").then(books => {
            if (!books) {
                console.log("null books", books);
                resolve(false);
                return;
            }
            console.log(books);
            if (Object.keys(books).length >= 66) {
                resolve(true);
                return;
            }
            resolve(false);
            return;
        }).catch((reason) => reject(reason));
    });
}

export function installToLocalStorage() {
    console.log("Downloading books now");
    return new Promise((resolve, reject) => {
        let booksSaved = 0;
        function bookIsSaved(book) {
            booksSaved++;
            if (booksSaved === 66) {
                resolve();
            }
        }


        let books = [ "1CH", "1KI", "1TH", "2CO", "2PE", "2TI", "AMO", "DEU", "EST", "EZR", "HAB", "HOS", "JDG", "JOB", "JOS", "LEV", "MAT", "NAM", "OBA", "PRO", "ROM", "TIT", "ZEC", "1CO", "1PE", "1TI", "2JN", "2SA", "3JN", "COL", "ECC", "EXO", "GAL", "HAG", "ISA", "JER", "JOL", "JUD", "LUK", "MIC", "NEH", "PHM", "PSA", "RUT", "ZEP", "1JN", "1SA", "2CH", "2KI", "2TH", "ACT", "DAN", "EPH", "EZK", "GEN", "HEB", "JAS", "JHN", "JON", "LAM", "MAL", "MRK", "NUM", "PHP", "REV", "SNG" ];
        books.forEach(book => bookLoader(book, bookIsSaved, reject));
    });
}

export function loadPassage(toc, start, end, passageLoadCompleted) {
    var book_range = getBookRange(toc, start, end);

    var book_loads = new Map();

    function loadError(book_id, err) {
        return {
            status: "error",
            book_id: book,
            error: err
        }
    }

    function loadBook(book) {
        var retries = 3;
        var delay = 100;

        function bookLoaded(bookData) {
            book_loads.set(book, {
                status: "success",
                book_id: book,
                data: bookData
            });
            if (book_loads.size == book_range.length) {

                // flatten the books into a single array, first
                var verses = [];
                book_range.forEach(function(b) {
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
    book_range.forEach(function(b) { loadBook(b); });
}

 
