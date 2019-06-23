const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const bodyParser = require('body-parser')

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
    var type = req.body.type;
    var cost = 0;

    if (type == "stamped")
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
    else if (type == "metered")
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
    else if (type == "large")
    {
      cost = 0.85 + 0.15 * ((weight + 1) / 1)
    }
    else if (type == "retail")
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

    res.render('pages/getRate', {cost: cost, type: type, weight: weight});
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
