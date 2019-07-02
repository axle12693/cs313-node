const { Pool } = require("pg");
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({connectionString: connectionString});

exports.forum_setup = app => {
    app.get('/forum', (req, res) => res.render("pages/forum_project/index.ejs"))
    .get('/forum/forum_categories', show_forum_categories)
    .get("/forum/forumsInCategory/:fcat_id", function(req, res) {
      sql = "SELECT * FROM Forum WHERE forum_category_id = $1";
      pool.query(sql, [req.params.fcat_id], function(err, result) {
        if (err) {
          console.log("Error in query: ")
          console.log(err);
        }
        res.send(result.rows) //test
      });
    })
};

function show_forum_categories(req, res)
{
  sql = "SELECT * FROM FORUM_CATEGORY";
  pool.query(sql, function(err, result) {
    if (err) {
      console.log("Error in query: ")
      console.log(err);
    }
    res.send(result.rows) //test
  });
}