(import path)
(defn s. [& args] (string ;args))

(declare-project 
  :name "mb-web-bible"
  :description "A PWA Bible app written in React, with a minimal Janet server."
  :dependencies ["path"
                 "https://github.com/swlkr/osprey"])

# 
(phony "bundle" []
       (def app-path (path/join "js" "app.jsx"))
       (def out-path (path/join "public" "js" "bundle.js"))
       (def esbuild (match (os/which)
                      :windows "esbuild.cmd"
                      _ "esbuild"))
       (def bundleProc (os/spawn [esbuild app-path "--bundle" "--minify" (s. "--outfile=" out-path)] :p))
         (:wait bundleProc))

(var bundle-proc nil)
(phony "watch-bundle" []
       (def app-path (path/join "js" "app.jsx"))
       (def out-path (path/join "public" "js" "bundle.js"))
       (def esbuild (match (os/which)
                      :windows "esbuild.cmd"
                      _ "esbuild"))
       (set bundle-proc (os/spawn 
                         [esbuild app-path 
                          "--bundle" 
                          #"--minify" 
                          "--sourcemap" 
                          "--watch"
                          (s. "--outfile=" out-path)] 
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

