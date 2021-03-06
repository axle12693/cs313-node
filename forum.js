const { Pool } = require("pg");
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({connectionString: connectionString});
const bcrypt = require('bcrypt');
const session = require("express-session");
const express = require("express")

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
})

exports.forum_setup = app => {
    app.use(session({
      secret: "this is alex",
      resave: false,
      saveUninitialized: true
    }))
    .use(function (req, res, next) {
      if (!req.session.login_vars_setup) {
        req.session.login_vars_setup = true;
        req.session.logged_in = false;
        req.session.logged_in_username = "";
        req.session.user_id = 0; //db index starts at 1
      }

      next()
    })
    .get('/forum', (req, res) => res.render("pages/forum_project/index.ejs"))
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
        res.send(result.rows)
      });
    })
    .use(express.urlencoded())
    .post("/forum/login", function (req, res) {
      sql = `SELECT pw_hash, app_user_id FROM App_User WHERE username = $1`;
      pool.query(sql, [req.body.uname], function(err, result) {
        if (err) {
          console.log("Error in query: ")
          console.log(err);
        }
        //console.log("Result of login query: " + result);

        bcrypt.compare(req.body.pword, result.rows[0]["pw_hash"], function(err, cryptRes) {
          //console.log("Input password: " + req.body.pword);
          //console.log("pw_hash: " + result.rows[0]["pw_hash"]);
          if (cryptRes)
          {
            req.session.logged_in = true;
            req.session.logged_in_username = req.body.uname;
            req.session.logged_in_user_id = result.rows[0]["app_user_id"];
          }
          res.send({
            success : req.session.logged_in,
            username : req.session.logged_in_username
          })
        });
        //res.send(result.rows)
      });
    })
    .post("/forum/updatePasswords", function(req, res){
      sql = `SELECT * from App_User WHERE pw IS NOT NULL`;
      pool.query(sql, function(err1, result) {
        if (err1) {
          console.log("Error in query: ")
          console.log(err1);
        }
        if (result.rows.length > 0)
        {
          for (key in result.rows)
          {
            //console.log("Key is: " + key);
            //console.log("result.rows[key] is " + result.rows[key])
            //console.log("result.rows[key][pw] is " + result.rows[key]["pw"])
            sql = `UPDATE App_User
                   SET pw = NULL,
                       pw_hash = $1
                   WHERE app_user_id = $2`;
            bcrypt.hash(result.rows[key]["pw"], 10, function(err2, hash) {
              if (err2) {
                console.log("Error in hashing: ")
                console.log(err3);
              }
              pool.query(sql, [hash, result.rows[key]["app_user_id"]], function(err3, result) {
                if (err3) {
                  console.log("Error in query: ")
                  console.log(err3);
                }
              });
            });
          }
        }
      });
    res.send("Success!");
    })
    .post("/forum/logout", function(req, res) {
      req.session.logged_in = false;
      req.session.logged_in_username = "";
      req.session.logged_in_user_id = 0;
      res.send("Success!");
    })
    .get("/forum/isLoggedIn", function(req, res) {
      res.send(req.session.logged_in);
    })
    .post("/forum/replyToPost", function(req, res) {
      content = req.body.content;
      post_id = req.body.post_id;
      if (req.session.logged_in)
      {
        sql =  `INSERT INTO Post_Comment
                  (post_id, app_user_id, post_comment_content, date_last_updated)
                VALUES
                  ($1, $2, $3, current_timestamp)`;
        pool.query(sql, [post_id, req.session.logged_in_user_id, content], function(err, result) {
          if (err) {
            console.log("Error in query: ")
            console.log(err);
          }
          res.send(!err);
        });
      }
      else
      {
        res.send(false);
      }
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
    res.send(result.rows)
  });
}