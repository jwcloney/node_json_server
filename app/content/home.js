$(function(){
    var tmpl,
    tdata ={};

    //init page
    var initPage = function(){
        $.get("/templates/home.html",function(d){
            tmpl = d;
            console.log("james here init page  " + tmpl);
        });

        //retrieve server data and init page
        $.getJSON("/albums.json",function(d){
            console.log("james here tdata " + tdata);
            console.log("james here d.data " + d.data);
            console
            $.extend(tdata, d.data);
        });

        //when ajax is done replace moustache tags
        $(document).ajaxStop(function(){
            var final_data = massage(tdata);
            console.log("james here final_data " + final_data);
            var rendered_page = Mustache.to_html(tmpl,final_data);
            $("body").html(rendered_page);
        })
    }();
});



function massage(data){
    if(data.albums && data.albums.length > 0){
        data.have_albums = true;
    }else{
        data.have_albums = false;
    }
    return data;
}