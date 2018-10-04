$(document).ready(function(){

    $(document).on('click', '#scrape', function(){
        $.get('/scrape', function(data){
            console.log('Scraped');
        });
    });

});