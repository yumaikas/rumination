# Ruminator

## About

This is a bible reader designed for a more meditative expereince.

## Setup

To set this up, you'll need, [sqlite3](https://sqlite.com/download.html), [janet](https://janet-lang.com/), and [esbuild](https://esbuild.github.io/getting-started/#install-esbuild). Then run `sqlite3 bible.db`. Once the sqlite command prompt is up, run `.read create-bible-db.sql` to populate the database.

You'll also want to run `jpm install path`, as the project file relies on being able to join the path for running some of the subcommands.


## Running

Once you have everything installed, you can run it by running `jpm run server`. 

