(import sqlite3 :as sql)
(import json)
(import path)
(defn s. [& args] (string ;args))


(defn main [& args] 
  (def db (sql/open "bible.db"))

  (defer (sql/close db)
    (def books (sql/eval db ```
                  Select book, short_name, long_name, book_num, min(canon_order) as min, max(canon_order) as max
                  from webp_bible_data as v
                  join book_names as b on b.book_code = v.book
                  group by book, short_name, long_name 
                  order by min(canon_order) asc
                  ```))
    (spit (path/join "json_bible" "toc.json") (json/encode books "\t" "\n"))

    (each book books 
      (def verses (sql/eval db ```
                Select canon_order, book, chapter, startVerse as verse, verseText
                from webp_bible_data as v
                where v.book = :book
                ``` {:book (book :book)} ))
      (spit (path/join "json_bible" (s. (book :book) ".json")) (json/encode verses "\t" "\n")))))

             

