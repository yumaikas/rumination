(use osprey)
(import err)
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

(var *port* 60808)

(let [port-str (os/getenv "PORT" "60808")]
 (set *port* (scan-number (os/getenv "PORT" "60808")))
 (when (nil? *port*) (err/str "PORT should be a number, not " port-str ".")))

(enable :static-files)
(when (= [:windows "development"] [(os/which) (os/getenv "DEPLOY_ENV")])
  (os/shell "start http://localhost:60808"))

(server *port*)
