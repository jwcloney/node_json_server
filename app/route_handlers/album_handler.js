/**
 * Created by jwcloney  on 09/10/2014.
 */

var fs = require('fs');

exports.version = "0.1";

exports.get_albums = function(req,res){
    list_albums(function(err,albums){
        if(err!=null){
            handle_unknown_type(res,err);
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


exports.get_album_photos = function(req,res){
    var album_name = req.params.album_name;
    var page = req.query.page;
    var page_size  = req.query.page_size;
    if ( isNaN(parseInt(page)) || page<0) page = 0;
    if ( isNaN(parseInt(page_size)) || page_size<0)page_size = 2;
    list_album_photos(album_name,page,page_size,function(err,photos){
        if(err!=null){
            handle_unknown_type(res,err);
        }

        send_sucess(res,{"albums":{"album_name":album_name,"photos":photos}});
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

function handle_unknown_type(res,err){
    send_failure(404,err,res)
    return;
}

function send_failure(http_code,err,res){
    var code = err.code ? err.code : err.message;
    res.writeHead(http_code,"content_type");
    res.end(JSON.stringify({error:code,message:err.message}));
}

function send_sucess(res,data){
    res.writeHead(200,"content_type");
    res.end(JSON.stringify({error:null,data:data}));
}
