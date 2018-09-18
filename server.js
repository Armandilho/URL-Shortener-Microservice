const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const urlExists = require('url-exists');

const Schema = mongoose.Schema;

app.use(bodyParser());
app.use(express.static(__dirname + '/public'));

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost/test'

mongoose.connect(MONGO_URI, {uri_decode_auth: true});

const db = mongoose.connection;

const urlSchema = new Schema({
  originalUrl: String,
  shortenedUrl: String
});

const Url = mongoose.model('Url', urlSchema);

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('CONECTOU NO BANCO');
});

const port = process.env.PORT || 3000;
const server = app.listen(port, function() {
  console.log('Express server listening on port ' + port);
});

app.get('/', (req, res) =>
  res.send(path.join(__dirname, '/public', 'index.html'))
  );

app.get('/url-shortener/:urlx', async (req, res) => {
  const { urlx } = req.params;
  console.log(urlx);
  const arrayquer = await Url.find({ shortenedUrl: urlx });
  if ( arrayquer.length !== 0 ){
    const { originalUrl } = arrayquer[0];
    res.redirect(originalUrl)
  } else {
    res.json( { "error" : "No short url found for given input" } );
  }
});

app.post('/url-shortener', async function (req, res) {{

  const { url_name } = req.body;

  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
  '(\\#[-a-z\\d_]*)?$','i'); // fragment locator

  if ( pattern.test( url_name ) === true ){
    urlExists(url_name , async function(err, exists) {
      if(exists === true){
        const arrayquer = await Url.find({ originalUrl: url_name });
        if ( arrayquer.length !== 0 ){
          const { originalUrl, shortenedUrl } = arrayquer[0];
          res.json({originalUrl, shortenedUrl});
          console.log("Já existe mano!!");
        } else {
          console.log("To registrando mano!!");
          const all = await Url.find();
          const createdUrl = await Url.create({ originalUrl: url_name, shortenedUrl: (all.length + 1) });
          const {originalUrl, shortenedUrl} = createdUrl
          res.json({originalUrl, shortenedUrl});
        }
        
      } else {
        res.json({ error : "Invalid Url, URL does not exist"});
      }
    });
  } else {
      res.json({ error : "Invalid Url regex Error"});
    }
  }
});

