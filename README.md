wakeloader
==========

No-module synchronous source loader for JavaScript.

#####Properties:
    string    main-file    path to main.js file
    string    main         name of main function
    string    update       when changed cache of queue will updated
    bool      quick        if true, main function will fired on DOMContentLoaded, if false - on load
    bool      cached       caching scripts queue
    object    alias        paths aliases
    array     queue        list of sources to load    

#####Usage:
You can set properties by two ways:

######1. By creating object before loading script
    <script>
        wakeloader = {
            mainFile :  "app/main",
            main     :  "main",
            update   :  "04.04.2013",
            quick    :  true,
            cahced   :  true,
            alias    :  { "http://code.jquery.com/" : "jquery/" },
            queue    :  ["app/widget","jquery/jquery-2.0.2.min",{ "http://some.serv.er/lib/" : ["sugar","backbone"] }]
        };
    </script>
    <script wake-loader src="wake/loader.min.js"></script>
    
######2. By setting attributes to `<script>`
    <script wake-loader data-main-file="app/main" data-main data-update="04.04.2013" 
            data-cached data-quick data-alias='{ "http://code.jquery.com/" : "jquery/" }' src="wake/loader.min.js">
        ["app/widget","jquery/jquery-2.0.2.min",{ "http://some.serv.er/lib/" : ["sugar","backbone"] }]            
    </script>
    
Also you can set queue in `data-queue` attribute. 

######Example of usage
    require('app/bootstrap.min','app/mywidgets'); // load sources
    wakeloader.updateQueue(); // reset cache
    
