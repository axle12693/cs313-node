const { Pool } = require("pg");
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({connectionString: connectionString});

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
})

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
    .get("/forum/postsInForum/:id", function(req, res) {
      sql = `SELECT      p.post_id, p.title, p.post_content, p.date_last_updated::date, au.username, p.date_last_updated AS dlu, f.forum_id, f.title AS ftitle, fc.forum_category_id, fc.title AS fctitle
             FROM        Post p INNER JOIN App_User au 
             ON          p.app_user_id = au.app_user_id INNER JOIN Forum f
             ON          p.forum_id = f.forum_id INNER JOIN Forum_Category fc
             ON          f.forum_category_id = fc.forum_category_id
             WHERE       p.forum_id = $1
             ORDER BY    dlu DESC`;
      pool.query(sql, [req.params.id], function(err, result) {
        if (err) {
          console.log("Error in query: ")
          console.log(err);
        }
        res.send(result.rows) //test
      });
    })
    .get("/forum/postDisplayDetails/:id", function(req,res) {
      sql = `SELECT      p.post_id, p.title, p.post_content, p.date_last_updated::date, au.username, p.date_last_updated AS dlu, f.forum_id, f.title AS ftitle, fc.forum_category_id, fc.title AS fctitle
             FROM        Post p INNER JOIN App_User au 
             ON          p.app_user_id = au.app_user_id INNER JOIN Forum f
             ON          p.forum_id = f.forum_id INNER JOIN Forum_Category fc
             ON          f.forum_category_id = fc.forum_category_id
             WHERE       p.post_id = $1
             ORDER BY    dlu DESC`;
      pool.query(sql, [req.params.id], function(err, result) {
        if (err) {
          console.log("Error in query: ")
          console.log(err);
        }
        res.send(result.rows) //test
      });
    })
    .get("/forum/postDisplayComments/:id", function(req, res) {
      sql = `SELECT      pc.post_comment_id, pc.post_comment_content, pc.app_user_id, pc.date_last_updated::date, au.username, pc.date_last_updated AS dlu
             FROM        Post p INNER JOIN Post_Comment pc
             ON          p.post_id = pc.post_id INNER JOIN App_User au
             ON          pc.app_user_id = au.app_user_id
             WHERE       pc.post_id = $1
             ORDER BY    dlu`;
      pool.query(sql, [req.params.id], function(err, result) {
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