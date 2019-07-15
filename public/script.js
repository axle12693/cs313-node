function setupMainPage()
{
    displayForumCategories();
    displayForumHeader(-1,-1, "", "")
}

function displayForumHeader(category_id, forum_id, category_name, forum_name)
{
    html = `<nav class="navbar navbar-expand-sm bg-light navbar-light">
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <a class="nav-link" href="#" onclick="displayForumCategories()">Mythical Pet Store Forums</a>
                    </li>`;

    if (category_id >= 0)
    {
        html +=    `<li class="nav-item">
                        <a class="nav-link" href="#" onclick="displayForumCategories()"> &gt;&gt; ` + category_name + `</a>
                    </li>`;
    }

    if (forum_id >= 0)
    {
        html +=    `<li class="nav-item">
                        <a class="nav-link" href="#" onclick="display_forum('` + forum_id + `')"> &gt;&gt; ` + forum_name + `</a>
                    </li>`;
    }
    html +=    `</ul>
            </nav>`;
    $("#forum_header").html(html);
}

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
        $("#content").html(html);
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
            fcat_el.html(fcat_el.html() + "<div class=\"card-body alink\" onclick=\"display_forum(" + data[key]["forum_id"] + ")\">" + data[key]["title"]);
        }
    });
}

function display_forum(id)
{
    $.get("/forum/postsInForum/" + id, function(data, status) {
        var html = "<div class=\"container\">";
        var i = 0;
        for (var key in data)
        {
            if (i % 2 == 0)
            {
                html += "<div class=\"card bg-primary text-white\">";
            }
            else
            {
                html += "<div class=\"card bg-info text-white\">";
            }
            i += 1;
            html += "<div class=\"card-body alink\" onclick=\"displayPost(" + data[key]["post_id"] + ")\">";
            html += data[key]["title"] + " - " + data[key]["username"] + " - " + data[key]["date_last_updated"];
            html += "</div></div>";
        }
        $("#content").html(html + "</div>");
        displayForumHeader(data[key]["forum_category_id"], data[key]["forum_id"], data[key]["fctitle"], data[key]["ftitle"]);
    });
}

function displayPost(id)
{
    $.get("forum/postDisplayDetails/" + id, function(data, status) {
        var html = "<div class=\"container\">";
        html += "<div class=\"card bg-success text-white\">";
        html += "<div class=\"card-header\">";
        html += "<h4>" + data[0]["title"];
        html += "</h4><hr>" + data[0]["post_content"] + "<br><br><hr>" + data[0]["username"] + " - " + data[0]["dlu"];
        html += "</div></div>";
        $("#content").html(html);
        displayForumHeader(data[0]["forum_category_id"], data[0]["forum_id"], data[0]["fctitle"], data[0]["ftitle"]);
        $.get("forum/postDisplayComments/" + id, function(data2, status2) {
            for (var key in data2)
            {
                html += "<div class=\"card bg-primary text-white\">";
                html += "<div class=\"card-body\">";
                html += data2[key]["post_comment_content"] + "<br><br><hr>";
                html += data2[key]["username"] + " - " + data2[key]["date_last_updated"];
                html += "</div></div>";
            }
            $("#content").html(html);
        });
    });
}

function tryLogin()
{
    $.post("forum/login", {uname : $("#uname").value(), pword : $("#pword").value()}, function(data, status) {
        if (data.success)
        {
            document.write("Success!")
        }
    });
}