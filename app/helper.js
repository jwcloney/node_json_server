/**
 * Created by jwcloney on 09/10/2014.
 */

exports.version = "0.1";

//var content_type = {"Content-Type":"application/JSON"};

exports.send_failure = function(http_code,err,res){
    var code = err.code ? err.code : err.message;
    res.writeHead(http_code,"content_type");
    res.end(JSON.stringify({error:code,message:err.message}));
}

exports.send_success = function (res,data){
    res.writeHead(200,"content_type");
    res.end(JSON.stringify({error:null,data:data}));
}