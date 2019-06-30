const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const bodyParser = require('body-parser')
const { Pool } = require("pg");
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({connectionString: connectionString});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})


express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(bodyParser.urlencoded({ extended: false }))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/w9prove', (req, res) => res.render('public/getRate'))
  .post('/getRate', function(req, res) 
  { 
    var weight = req.body.weight;
    var t = req.body.t;
    var cost = 0;

    if (t == "stamped")
    {
      if (weight <= 1)
      {
        cost = 0.55
      }
      else if (weight <= 2)
      {
        cost = 0.7
      }
      else if (weight <= 3)
      {
        cost = 0.85
      }
      else
      {
        cost = 1
      }
    }
    else if (t == "metered")
    {
      if (weight <= 1)
      {
        cost = 0.5
      }
      else if (weight <= 2)
      {
        cost = 0.65
      }
      else if (weight <= 3)
      {
        cost = 0.8
      }
      else
      {
        cost = 0.95
      }
    }
    else if (t == "large")
    {
      cost = 0.85 + 0.15 * Math.ceil(weight)
    }
    else if (t == "retail")
    {
      if (weight <= 4)
      {
        cost = 3.66
      }
      else if (weight <= 8)
      {
        cost = 4.39
      }
      else if (weight <= 12)
      {
        cost = 5.19
      }
      else
      {
        cost = 5.71
      }
    }

    res.render('pages/getRate', {cost: cost, t: t, weight: weight});
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
  .listen(PORT, () => console.log('Listening on ${ PORT }'))


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