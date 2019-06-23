const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/w9prove', (req, res) => res.render('public/w9prove/index'))
  .post('/w9prove', function(req, res) 
  { 
    var t = req.body.type;
    res.render('pages/w9prove/index', {type: t});
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
