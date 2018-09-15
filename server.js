const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const urlExists = require('url-exists');

const Schema = mongoose.Schema;

app.use(bodyParser());
app.use(express.static(__dirname + '/public'));

mongoose.connect('mongodb://localhost/test');

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

app.post('/url-shortener', async function (req, res) {{

  const { url_name } = req.body;

  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
  '(\\#[-a-z\\d_]*)?$','i'); // fragment locator

  //usar o regexp para validar a url, depois usar o dns para verificar se o site existe
  //caso as duas condições sejam satisfeitas retorne o json com o a Original e a Short

  if(pattern.test( url_name ) === true){ //caso não passe no regex ele retorna um json com o erro
    //Invalid Url regex Error
    urlExists(url_name , async function(err, exists) {
      if(exists === true){
        console.log("Eh uma URL verdadeira");
        const all = await Url.find();
        const createdUrl = await Url.create({ originalUrl: url_name, shortenedUrl: (all.length + 1) });
        const {originalUrl, shortenedUrl} = createdUrl
        res.json({originalUrl, shortenedUrl});
      } else {
        console.log("Eh uma URL falsa");
        res.json({ error : "Invalid Url, URL does not exist"});
      }
    });

  } else {
    res.json({ error : "Invalid Url regex Error"});
  }
  }
});

