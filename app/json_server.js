/**
 * jwcloney 05/10/2014.
 * Simple WEB server that will return JSON which is then rendered using Mustache
 * using a javascript bootstrapper.
 *
 * Pretty basic but its something to start with..
 */


var http = require("http"),
    url = require('url'),
    path = require('path'),
    fs = require("fs");


function handle_request(req,res){
    req.parsed_url = url.parse(req.url,true);

    var core_url = req.parsed_url.pathname;

    //serve items form content
    if(core_url.substr(0,9) =='/content/'){
        serve_static_html('content/',core_url.substr(9),req,res);
    //serve items from pages
    }else if(core_url.substr(0,7) =='/pages/'){
       serve_page(req,res);
    //serve items from templates
    }else if(core_url.substr(0,11) =='/templates/'){
       serve_static_html('templates/',core_url.substr(11),req,res);
    //serve our photo album list
    }else if(core_url =='/albums.json'){
        handle_get_albums(req,res);
    //serve our actual photos
    }else if( (core_url.substr(0,7)=="/albums") && (core_url.substr(core_url.length -5 ) ==".json") ){
        handle_get_album_photos(req,res);
    //hanle everything else
    }else{
        handle_unknown_type(req,res);
    }
}

function serve_page(req,res){
    var file = req.parsed_url.pathname.substr(7);
    fs.readFile("basic.html","utf8",function(err,contents){
       if(err){
           res.writeHead(503,{"Content-Type":"text/html"})
           res.end("File not found");
       }
       res.writeHead(200,{"Content-Type":"text/html"})
       res.end(contents.replace("{{PAGE_NAME}}",file));
    });
}


function serve_static_html(folder,file,req,res){
    var fn =  folder + file;
    var rs = fs.createReadStream(fn);
    var ct = get_content_type(fn);

    rs.on('error',function(){
       res.writeHead(404,{"Content-type":"application/json"});
       res.write({error:"bad file",message:"file not found"});
    });

    res.writeHead(200,{"Content-Type":ct});
    rs.pipe(res);

    /****************************************************************
     * leaving this in for reference... this has all been replaced
     * with the rs.pipe(res)
    //full stack for event driven async processing
    rs.on('readable',function(){
        var d = rs.read();
        if(typeof d == 'string'){
            console.log("its a string");
            res.write(d);
        }else if(typeof d == 'object' && d instanceof Buffer){
            console.log("its a buffer");
            if(get_content_type(fn).substr(0,6) == 'images/'){
                res.write(d);
            }else{
                res.write(d.toString("utf8"));
            }
        }
    });
    rs.on('end',function(){
        res.end();
    });

    rs.on('error',function(){
    res.writeHead(404,{"Content-type":"application/json"});
    res.write({error:"bad file",message:"file not found"});
    });
    *
    *****************************************************************/


}

function handle_unknown_type(req,res){
    res.writeHead(404,{"Content-Type":"application/JSON"})
    res.end(JSON.stringify({"error":"malformed url"})+"\n");
    return;
}

function handle_get_albums(req,res){
    list_albums(function(err,albums){
        if(err!=null){
            handle_unknown_type(req,res);
        }
        res.writeHead(200,{"Content-Type":"Application/JSON"});
        res.end(JSON.stringify(
            {
                "error": null,"data":
                {
                    "albums" : albums
                }
            }
        )+"\n");

    });
}

function get_content_type(filename){

    var ext = path.extname(filename).toLowerCase();
    switch(ext){
        case '.jpg' : case  '.jpeg' :
            return "image/jpg";
        case '.gif' :
            return "image/gif";
        case '.xml' :
            return "text/xml";
        case '.png' :
            return "image/png";
        case '.js' :
            return "text/javascript";
        case '.css' :
            return "text/css";
        case '.html' :case '.htm':
            return "text/html";
        default : return "text/plain"
    }
}


function handle_get_album_photos(req,res){

    var core_url = req.parsed_url.pathname;

    var album_name = core_url.substr(7,core_url.length -12);
    var page = req.parsed_url.query.page;
    var page_size  = req.parsed_url.query.page_size;
    if ( isNaN(parseInt(page)) || page<0) page = 0;
    if ( isNaN(parseInt(page_size)) || page_size<0)page_size = 2;
   list_album_photos(album_name,page,page_size,function(err,photos){
        if(err!=null){
            handle_unknown_type(req,res);
        }
        res.writeHead(200,{"Content-Type":"Application/JSON"});
        res.end(JSON.stringify(
            {
                "error":null,"data":
                {
                    "albums":
                    {
                        "album_name":album_name,"photos":photos
                    }
                }
            }
        )+"\n");
    });
}


function list_albums(callback){
    fs.readdir("albums/",function(err,file_list){
        if(err){
            callback(err);
            return;
        }
        var dirs_only =[];
        (function iterator(i){
            if(i >= file_list.length){
              callback(null,dirs_only);
              return;
            }
            fs.stat("albums/" + file_list[i] , function(err,stats){
                if(err){
                    callback(err);
                    return;
                }
                if(stats.isDirectory()){
                    dirs_only.push({album_name : file_list[i],title:file_list[i]});
                }
                iterator(i + 1);
            });
        })(0);
    });
}

function list_album_photos(album_name,page,page_size,callback){
    fs.readdir("albums/" + album_name,function(err,file_list){
        if(err){
            callback(err);
            return;
        }
        var files_only =[];
        (function iterator(i){
            if(i >= file_list.length){
                var photos = files_only.splice(page * page_size, page_size);
                callback(null,photos);
                return;
            }
            fs.stat("albums/" + album_name + "/" + file_list[i] , function(err,stats){
                if(err){
                    callback(err);
                    return;
                }
                if(stats.isFile()){
                    files_only.push(file_list[i]);
                }
                iterator(i + 1);
            });
        })(0);
    });
}

//kickin the tires and lighting the fires!!
var server = new http.createServer(handle_request);
server.listen(8080);
