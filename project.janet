(import path)
(defn s. [& args] (string ;args))

(declare-project 
  :name "rumination"
  :description "A PWA Bible app written in React, with a minimal Janet server."
  :author "Andrew Owen <yumaikas94@gmail.com>"
  :url "https://github.com/yumaikas/rumination"
  :dependencies ["path"
                 "https://github.com/yumaikas/janet-errs"
                 "https://github.com/swlkr/osprey"])

(def react-path (path/abspath (path/join "js" "vendor" "react")))

(defn- swap-react [& args]
  (def [react react-dom] args)
  (def curr-path (os/cwd))
  (defer (os/cd curr-path)
    (os/cd react-path)
    (spit "../react.js" (slurp react))
    (spit "../react.dom.js" (slurp react-dom))))

(defn- adjust-react [] 
  (match (os/getenv "DEPLOY_ENV") 
    "production" (swap-react "react.production.js" "react.dom.production.js")
    _ (swap-react "react.development.js" "react.dom.development.js")))

# TODO: Copy sw.js from js/ to public/js, rather than leaving it in public/js
(phony "bundle" []
       (adjust-react)
       (def app-path (path/join "js" "app.jsx"))
       (def out-path (path/join "public" "js" "bundle.js"))
       (def app-path (path/join "js" "app.jsx"))
       (def esbuild (match (os/which)
                      :windows "esbuild.cmd"
                      _ "esbuild"))
       (def bundleProc 
         (os/spawn [esbuild app-path "--bundle" "--minify" (s. "--outfile=" out-path)] :p))

       (:wait bundleProc))

(var bundle-proc nil)
(phony "watch-bundle" []
       (adjust-react)
       (def app-path (path/join "js" "app.jsx"))
       (def app-out-path (path/join "public" "js" "bundle.js"))
       (def esbuild (match (os/which)
                      :windows "esbuild.cmd"
                      _ "esbuild"))
       (set bundle-proc (os/spawn 
                         [esbuild app-path 
                          "--bundle" 
                          #"--minify" 
                          "--sourcemap" 
                          "--watch"
                          (s. "--outfile=" app-out-path)] 
                         :p)))

(phony "server" ["watch-bundle"]
       (def server-proc (os/spawn ["janet" "serve.janet"] :p))
       (prompt :done
       (forever 
         (print `enter "X" to exit.` )
         (def input (:read stdin :line))
         (match (string/trim input)
           "X" (return :done))))
       (:kill server-proc)
       (:kill bundle-proc))

