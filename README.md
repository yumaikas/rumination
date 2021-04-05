# Ruminator

## About

This is a bible reader designed for a more a slower, more medidative experience. It encourages this in a couple of ways: It keeps track of where you left off, so you can easily back to the passage later, after having had a chance to let it sit. It also only lets you add verses one at a time. This is to encourage you to take time, and sit with each verse before you add another. 

## Setup

To set this up, you'll need [janet](https://janet-lang.com/) and [esbuild](https://esbuild.github.io/getting-started/#install-esbuild). The easiest way to install esbuild is using `npm`, and running `npm install esbuild`, and then copying `esbuild` from `node_modules/esbuild/bin` to a location on the `$PATH`. 

You'll also want to run `jpm install path`, as the project file relies on being able to join the path for running some of the subcommands.

Once those are set up, you should be able to run `jpm run bundle`, which will create a `bundle.js` in the `public/js` directory. To create a production build, run `DEPLOY_ENV=production jpm run bundle`.

Once you have everything installed, you can run it by running `janet serve.janet`. `serve.janet` uses the `PORT` environment variable to establish which port to listen on, defaulting 60808 by default. It will only listen on localhost by default.

## Technical details

Ruminator has React for rendering it's UI, uses localforage (a wrapper around IndexedDB/Localstorage) to store book content, and Janet to serve up the files/folders. 

Long term, I want to make this a persistent web app, and the first step I've taken in that direction is cachine the book contents in indexedDB, suc

Also, because there aren't any forms (yet) for this, everything is driven by hyperlinks, and the rendered state is driven the by the location hash. As this currently stands, it uses a custom, hook-based router, as opposed to React-router. This is due to the project being ported from another framework, which was using similar router logic. 
