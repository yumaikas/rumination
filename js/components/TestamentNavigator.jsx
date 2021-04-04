import React from '../vendor/react';
import {BookLink} from './BookLink.jsx';

export function TestamentNavigator(props) { 
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
