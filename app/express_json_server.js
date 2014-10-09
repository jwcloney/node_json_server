/**
 * jwcloney 05/10/2014.
 * Simple WEB server that will return JSON which is then rendered using Mustache
 * using a javascript bootstrapper.
 *
 * Pretty basic but its something to start with..
 */


var http = require("http"),
    path = require('path'),
    express = require('express'),
    album_handler = require('./route_handlers/album_handler.js'),
    fs = require("fs");

var app = express();


//get json
app.get("/ver1/albums.json",album_handler.get_albums);
//get content for file
app.get("/content/:file_name",function(req,res){
    serve_static_html("content/",req.params.file_name,req,res);
});
//get template for file
app.get("/templates/:file_name",function(req,res){
    serve_static_html("templates/",req.params.file_name,req,res);
})
//get album by name
app.get("/ver1/albums/:album_name",album_handler.get_album_photos);

app.get("/pages/:page_name",serve_page);

app.get("*",function(req,res){
   handle_unknown_type(req,res);
});

function serve_page(req,res){
    var file = req.params.page_name;
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
}

function handle_unknown_type(req,res){
    res.writeHead(404,{"Content-Type":"application/JSON"})
    res.end(JSON.stringify({"error":"malformed url"})+"\n");
    return;
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






//kickin the tires and lighting the fires!!
app.listen(8080);

//var server = new http.createServer(handle_request);
//server.listen(8080);
