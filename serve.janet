(use osprey)
(import path)
(import ./views :as v)

(defn s. [& args] (string ;args))

(def valid-book-ids 
  (as-> 
    (os/dir "./json_bible") it
    (filter |(and 
               (not= $ "toc.json")
               (string/has-suffix? ".json" $)) it)
    (map |[(slice $ 0 -6) true] it)
    (flatten it)
    (table ;it)))

(defn get-book-file [id] 
  (when (valid-book-ids id)
    (path/join "json_bible" (s. id ".json"))))

(GET "/" (ok text/html (v/home)))

(GET "/toc"
     @{:status 200 
       :headers @{"Content-Type" "application/json"} 
       :body (slurp (path/join "json_bible" "toc.json"))})

(GET "/book/:book-id"
     (pp (params :book-id))
     (if-let [book-path (-> (params :book-id) get-book-file) ]
       @{:status 200
         :headers @{"Content-Type" "application/json"}
         :body (slurp book-path)}

       @{:status 404
         :headers @{"Content-Type" "text/plain"}
         :body (s. "Book ID " (params :book-id) " is not valid") }))

(enable :static-files)
(os/shell "start http://localhost:60808")
(server 60808 "0.0.0.0")
