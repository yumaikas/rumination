(import janet-html :as html)

(defn s. [& args] (string ;args))

(defn layout [body] 
  (html/encode 
    (html/doctype :html5)
    [:html {:lang "en"}
     [:head
      [:meta :charset "utf-8"]
      [:meta {:name "viewport" :content "width=device-width, initial-scale=1.0"} ] 
      [:link {:rel "manifest" :href "manifest.json"} ]
      [:link {:rel "stylesheet" :href "/css/app.css"} ] ]
     [:body body]]))

(defn home [] 
  (layout 
    [:div
     [:div {:id "bible-app-id"}]
     [:script {:src "/js/bundle.js" :type "text/javascript"}] ]))
