import React from '../vendor/react';

export function About(props) {
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
