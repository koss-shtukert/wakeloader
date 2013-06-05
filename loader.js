/*

wakeloader - scripts loader and main function caller for JavaScript. recommend only for developing.
Copyright (C) 2013 TrigenSoftware

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

Props:
    string    main-file    path to main.js file
    string    main         name of main function
    string    update       string to update queue
    bool      quick        if true, main function will fired on DOMContentLoaded, if false - on load
    bool      cached       caching scripts queue
    object    alias        paths aliases
    array     queue        list of sources to load    

Methods:
    require - load soruces
    updateQueue - reset cache

*/

(function(){
    var ldd = false, mcl = true,
        q = document.createElement('require'),
        wl = document.querySelectorAll('script[wake-loader]'), tq = [];
    if(wl.length != 1) return; 
    wl = wl[0];    
    
    function load(url,islast){        
        if(scriptLoaded(url)) return; 
        var script = document.createElement('script'); 
        script.async = false; 
        script.src = url;
        if(islast) script.onload = function(){ 
            mcl = false; 
            if(ldd || (wl.async && wakeloader.quick)) onload();
        };
        q.appendChild(script);
    }

    function unalias(url,iscss){     
        for(var i in wakeloader.alias) if(url.indexOf(wakeloader.alias[i]) == 0) url = url.replace(wakeloader.alias[i],i);  
        if((url.indexOf('.css') == -1 || url.length - 4 != url.indexOf('.css')) && iscss) url += '.css';    
        if((url.indexOf('.js') == -1 || url.length - 3 != url.indexOf('.js')) && !iscss) url += '.js';
        if(url[0] != '/' && url.indexOf('://') == -1) url = '/' + url;    
        return url;
    }

    function unpack(urls,iscss){
        var ret = [];
        for(var i in urls) if(typeof urls[i] == 'object')
            for(var j in urls[i]) for(var ji in urls[i][j]) tq.push(unalias(j+urls[i][j][ji],iscss));            
            else ret.push(unalias(urls[i],iscss)); 
        return ret;
    }

    function scriptLoaded(url){
        return (document.querySelectorAll('script[src="'+url+'"]').length > 0 || document.querySelectorAll('script[data-src="'+url+'"]').length > 0 ||
           q.querySelectorAll('script[src="'+url+'"]').length > 0 || q.querySelectorAll('script[data-src="'+url+'"]').length > 0);         
    }

    function styleLoaded(url){
        return (document.querySelectorAll('link[href="'+url+'"]').length > 0 || document.querySelectorAll('style[data-src="'+url+'"]').length > 0); 
    }

    function onload(){ 
        ldd = true;
        if(wakeloader.main && !mcl) window[wakeloader.main]();
    };

    if(!window.wakeloader) window.wakeloader = {}; 

    if(!wakeloader.main && (wl.dataset.main || wl.dataset.main == '')) wakeloader.main = (wl.dataset.main == '') ? 'main' : wl.dataset.main;
    if(!wakeloader.main) wakeloader.main = false;    

    if(!wakeloader.quick && (wl.dataset.quick == 'true' || wl.dataset.quick == '')) wakeloader.quick = true;
    if(!wakeloader.quick) wakeloader.quick = false;
    
    if(!wakeloader.cached && (wl.dataset.cached == 'true' || wl.dataset.cached == '')) wakeloader.cached = true;
    if(!wakeloader.cached) wakeloader.cached = false;    
    
    if(!wakeloader.update && wl.dataset.update) wakeloader.update = wl.dataset.update;
    if(!wakeloader.update) wakeloader.update = 'wakeDefault';   
    if(!localStorage.wakeloaderUpdate) localStorage.wakeloaderUpdate = 'wakeDefault';

    if(!wakeloader.queue && wl.innerHTML.trim().length > 0){ 
        try{ 
            wakeloader.queue = JSON.parse(wl.innerHTML.trim());
        }catch(e){ 
            wakeloader.queue = false; 
        };
    }
    if(!wakeloader.queue && wl.dataset.queue){ 
        try{ 
            wakeloader.queue = JSON.parse(wl.dataset.queue); 
        }catch(e){ 
            wakeloader.queue = false; 
        };
    }

    if(wakeloader.cached){
        if(localStorage.wakeloaderUpdate != wakeloader.update){
            wakeloader.queue = false;
            localStorage.wakeloaderQueue = '';
            localStorage.wakeloaderUpdate = wakeloader.update;
        } else if(localStorage.wakeloaderQueue){ 
            var lsq = [];
            try{ 
                lsq = JSON.parse(localStorage.wakeloaderQueue);
            }catch(e){};
            if(!wakeloader.queue) wakeloader.queue = lsq;
            else for(var i in lsq) wakeloader.queue.push(lsq[i]); 
        }
    } else localStorage.wakeloaderQueue = '';
    if(!wakeloader.queue) wakeloader.queue = [];

    if(!wakeloader.mainFile && wl.dataset.mainFile){ 
        wakeloader.mainFile = unalias(wl.dataset.mainFile); 
        wakeloader.queue.push(wakeloader.mainFile); 
    }
    if(!wakeloader.mainFile) wakeloader.mainFile = false;

    if(!wakeloader.alias && wl.dataset.alias){ 
        try{ 
            wakeloader.alias = JSON.parse(wl.dataset.alias); 
        }catch(e){ 
            wakeloader.alias = false; 
        };
    }
    if(!wakeloader.alias) wakeloader.alias = {};

    window.addEventListener((wakeloader.quick) ? 'DOMContentLoaded' : 'load', onload, false);

    window.require = function(url){
        if(arguments.length > 1){ 
            for(var i in arguments) window.require(arguments[i]);
            return; 
        }
        if(typeof url == 'array' || typeof url == 'object'){ 
            url = unpack((typeof url == 'object') ? [url] : url);
            for(var i in url) window.require(url[i]); 
            return; 
        }
        url = unalias(url);        
        if(scriptLoaded(url)) return;  
        var script = document.createElement("script"), xhr = new XMLHttpRequest; 
        script.dataset.src = url;
        xhr.onreadystatechange = function(e){ 
            try{ 
                if(e.target.statusText == "OK" && e.target.readyState == 4){ 
                    script.innerHTML = e.target.responseText; 
                    q.insertBefore(script,q.firstChild); 
                    if(!localStorage.wakeloaderQueue) localStorage.wakeloaderQueue = '[]'
                    try{
                        var queue = JSON.parse(localStorage.wakeloaderQueue);
                        queue.push(url);
                        localStorage.wakeloaderQueue = JSON.stringify(queue);  
                    }catch(e){
                        var queue = [];
                        queue.push(url);
                        localStorage.wakeloaderQueue = JSON.stringify(queue); 
                    }
                } 
            }catch(e){} 
        };
        xhr.open('GET',url,false);
        xhr.send();
    }
    /*
    window.require_style = function(url){
        var lcb = false, nargs = []; 
        for(var i in arguments){ 
            if(typeof arguments[i] == 'function'){ 
                lcb = arguments[i]; 
                delete arguments[i]; 
            } else if(arguments[i]) nargs.push(arguments[i]);
        }
        arguments = nargs;
        if(arguments.length > 1){ 
            for(var i in arguments) window.require_style(arguments[i],lcb); 
            return; 
        }
        if(typeof url == 'array' || typeof url == 'object'){ 
            url = unpack(((typeof url == 'object') ? [url] : url),true);
            for(var i in url) window.require_style(url[i],lcb); 
            return; 
        }
        url = unalias(url,true);        
        if(styleLoaded(url)) return;        
        var style = document.createElement("style"), xhr = new XMLHttpRequest;
        style.dataset.src = url;
        xhr.onreadystatechange = function(e){ 
            try{ 
                if(e.target.statusText == "OK" && e.target.readyState == 4){ 
                    style.innerHTML = e.target.responseText; 
                    q.insertBefore(style,q.firstChild); 
                    if(lcb) lcb(); 
                } 
            }catch(e){} 
        };
        xhr.open('GET',url,!!lcb);
        xhr.send();
    }
    */
    wakeloader.updateQueue = function(){
        wakeloader.update = localStorage.wakeloaderUpdate = Date();
        return wakeloader.update;
    }
    
    wakeloader.queue = unpack(wakeloader.queue);
    for(var i in wakeloader.queue) load(wakeloader.queue[i], i == wakeloader.queue.length - 1 );
    
    if(wl.nextSibling) wl.parentNode.insertBefore(q,wl.nextSibling);
    else wl.parentNode.appendChild(q); 
})();