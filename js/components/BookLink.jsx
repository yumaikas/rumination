import React from '../vendor/react';

export function BookLink(props) {
    var book = props.book
    return <a href={"#book/" + book.book} className="larger" style={{display:"block"}}> {book.short_name}</a>;
};
