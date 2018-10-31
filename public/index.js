$(document).ready(function(){

    $(document).on('click', '#scrape', function(){
        $.get('/articles', function(data){
            console.log('Scraped');
        });
    });

});