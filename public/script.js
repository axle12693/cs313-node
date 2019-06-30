function displayForumCategories()
{
    $.get("/forum/forum_categories", function(json_fcats, status){
        let html = "<div class=\"container\">";
        for (var key in json_fcats)
        {
            html += "<div class=\"card bg-primary text-white\" id=\"fcat" + json_fcats[key]["forum_category_id"] + "\">";
            html += "<div class=\"card-header\"><h4>" + json_fcats[key]["title"] + "</h4></div>";
            html += "</div>";
        }
        html += "</div>";
        $("#body_container").html(html);
        for (var key in json_fcats)
        {
            displayForums(json_fcats[key]["forum_category_id"]);
        }
      });
}

function displayForums(cat_id)
{
    $.get("/forum/forumsInCategory/" + cat_id, function(data, status){
        let fcat_el = $("#fcat" + cat_id);
        for (var key in data)
        {
            fcat_el.html(fcat_el.html() + "<div class=\"card-body alink\">" + data[key]["title"]);
        }
    });
}