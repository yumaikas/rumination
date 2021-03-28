/*
cocholate - v3.0.3

Written by Federico Pereiro (fpereiro@gmail.com) and released into the public domain.

Please refer to readme.md to read the annotated source.
*/

(function () {

   // *** SETUP ***

   // if (typeof exports === 'object') return console.log ('cocholate only works in a browser!');

   var dale   = require('./dale');
   var teishi = require('./teishi');

   var type = teishi.type, clog = teishi.clog;

   // *** NON-DOM FUNCTIONS ***
    var c = {};

   c.ready = function (fun) {
      if (window.addEventListener) return window.addEventListener ('load', fun, false);
      if (window.attachEvent)      return window.attachEvent      ('onload', fun);
      var interval = setInterval (function () {
         if (document.readyState === 'complete') fun () || clearInterval (interval);
      }, 10);
   }

   c.cookie = function (cookie) {
      if (cookie === false) {
         return dale.go (document.cookie.split (/;\s*/), function (v) {
            document.cookie = v.replace (/^ +/, '').replace (/=.*/, '=;expires=' + new Date ().toUTCString ())
            return v;
         });
      }
      return dale.obj ((cookie || document.cookie).split (/;\s*/), function (v) {
         if (v === '') return;
         v = v.split ('=');
         var name = v [0];
         var value = v.slice (1).join ('=');
         return [name, value];
      });
   }

   exports.ajax = c.ajax = function (method, path, headers, body, callback) {
      method   = method   || 'GET';
      headers  = headers  || {};
      body     = body     || '';
      callback = callback || function () {};
      if (teishi.stop ('c.ajax', [
         ['method',   method,   'string'],
         ['path',     path,     'string'],
         ['headers',  headers,  'object'],
         ['callback', callback, 'function']
      ])) return false;

      var r = window.XMLHttpRequest ? new XMLHttpRequest () : new ActiveXObject ('Microsoft.XMLHTTP');
      r.open (method.toUpperCase (), path, true);
      if (teishi.complex (body) && type (body, true) !== 'formdata') {
         headers ['content-type'] = headers ['content-type'] || 'application/json';
         body = teishi.str (body);
      }
      dale.go (headers, function (v, k) {
         r.setRequestHeader (k, v);
      });
      r.onreadystatechange = function () {
         if (r.readyState !== 4) return;
         if (r.status !== 200 && r.status !== 304) return callback (r);
         var json;
         var res = {
            xhr: r,
            headers: dale.obj (r.getAllResponseHeaders ().split (/\r?\n/), function (header) {
               if (header === '') return;
               var name = header.match (/^[^:]+/) [0], value = header.replace (name, '').replace (/:\s+/, '');
               if (name.match (/^content-type/i) && value.match (/application\/json/i)) json = true;
               return [name, value];
            })
         };
         res.body = json ? teishi.parse (r.responseText) : r.responseText;
         callback (null, res);
      }
      r.send (body);
      return {headers: headers, body: body, xhr: r};
   }
}) ();

