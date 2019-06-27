function displayForumCategories()
{
    $.get("/forum/forum_categories", function(data, status){
        json_fcats = data;//JSON.parse(data);
        html = "<div class=\"container\">";
        json_fcats.foreach(function(element) {
            html += "<div class=\"card bg-primary text-white\">";
            html += "<div class=\"card-header\"><h4>" + element["title"] + "</h4></div>";
            html += "</div>";
        });
        html += "</div>";
      });
}