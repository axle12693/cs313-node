function displayForumCategories()
{
    $.get("/forum/forum_categories", function(data, status){
        json_fcats = JSON.parse(data);
        html = "<div class=\"container\">";
        json_fcats.foreach(function(element) {
            html += "<div class=\"card bg-primary text-white\">";
            html += "<div class=\"card-header\"><h4>" + element["title"] + "</h4></div>";
            await $.get("/forum/forums", function(data2, statu2s) {
                json_forums = JSON.parse(data2);
                json_forums.foreach(function(element2) {
                    html += "<div class=\"card-body alink\">" + element2["title"] + "</div>"
                });
            html += "</div>";
            });
        });
        html += "</div>";
      });
}