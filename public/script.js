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
    hideReply(true);
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
    hideReply(true);
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
    hideReply(true);
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
            $.get("forum/isLoggedIn", function(data, status) {
                if (data)
                {
                    showReply(id);
                }
            })
        });
    });
    viewingPost = true;
    viewingPostID = id;
}

function tryLogin()
{
    $.post("forum/login", {uname : $("#uname").val(), pword : $("#pword").val()}, function(data, status) {
        if (data.success)
        {
            html = "Hello " + data["username"] + "&nbsp;&nbsp;";
            html += "<div class=\"form-inline my-2 my-lg-0\">";
            html += "<button class=\"btn btn-outline-success my-2 my-sm-0\" onclick=\"logout()\">Log out</button>";
            html += "</div>";
            html += "<a class=\"nav-link\" href=\"#\">Change password</a>";
            $("#loginbar").html(html);
            if (viewingPost)
                showReply(viewingPostID);
        }
    });
}

function replyToPost(id)
{
    $.post("forum/replyToPost", {content : $("#replyText").val(), post_id : id}, function(data, status) {
        if (data)
        {
            $("#replyText").val("");
            displayPost(id);
        }
        else
        {
            alert("Please log in before attempting to reply to a post!");
        }
    })
}

function showReply(post_id)
{
    html =    `<div class="container">
                    <div class="card bg-secondary text-white">
                        <div class="card-body">
                            <textarea class="form-control" id="replyText" cols="30" rows="10"></textarea>
                            <button value="Reply" onclick="replyToPost(` + post_id + `)">Reply</button>
                        </div>
                    </div>
                </div>`;
    $("#reply").html(html);
}

function hideReply(disable)
{
    $("#reply").html("")
    viewingPost = !disable;
}

function logout()
{
    $.post("forum/logout", function(data, status) {
        html = `<div class="form-inline my-2 my-lg-0">
                    <input class="form-control mr-sm-2" type="text" placeholder="Username" id="uname">
                    <input class="form-control mr-sm-2" type="password" placeholder="Password" id="pword">
                    <button class="btn btn-outline-success my-2 my-sm-0" onclick="tryLogin()">Login/Sign up</button>
                </div>`;
        $("#loginbar").html(html);
        hideReply(false);
    })
}