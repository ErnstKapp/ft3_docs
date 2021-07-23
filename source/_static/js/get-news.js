
/* Fetching information for the news-flash */

if ($('.news-flash').length > 0){

    // When testing you will need to change the 
    // 'Access-Control-Allow-Origin' header to the correct url
    // on the chromia site.
    let url = 'https://chromia.com/get-news.json';

    $.ajax(url, 
    {
        dataType: 'json',
        async: false, 
        success: function (data) {
            if (data.developer.bannernews && data.developer.bannernews.enabled){

                let newsMessage = document.createElement('a');
                newsMessage.textContent = data.developer.bannernews.message;
                newsMessage.href = data.developer.bannernews.url;

                $('.news-flash').append(newsMessage);
                $('.news-flash').addClass('show');
            }
        },
        error: function(e) {
            console.log(e);
        }
    });
};
