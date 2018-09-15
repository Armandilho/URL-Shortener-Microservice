const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const path = require('path');
const dns = require('dns');
var http = require('http');

const options = {
  family: 6,
  hints: dns.ADDRCONFIG | dns.V4MAPPED,
};

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
  const teste = url_name;

  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
  '(\\#[-a-z\\d_]*)?$','i'); // fragment locator

  //usar o regexp para validar a url, depois usar o dns para verificar se o site existe
  //caso as duas condições sejam satisfeitas retorne o json com o a Original e a Short
  result = teste.replace(/^(?:https?:\/\/)?(\.)?/i, "").split('/')[0];



  if(pattern.test(url_name) === true){
    dns.lookup( result, function (err, addresses) {
      if(err) {
        res.json({ error : "invalid Url dns Error" });
      } else {
        console.log(addresses);
        
      }
    });
  } else {
    res.json({ error : "invalid Url regex Error" });
  }
    //uses the core modules to run an IPv4 resolver that returns 'err' on error
  // calls the function of a given url        


/*
  if(pattern.test(url_name) === true){
    dns.lookup( result, function (err, addresses) {
      if(err) {
        res.json({ error : "invalid Url dns Error" });
      } else {
        console.log(addresses);
        
      }
    });
  }else{
    res.json({ error : "invalid Url regex Error" });
  }*/
    
    const all = await Url.find();
    const createdUrl = await Url.create({ originalUrl: url_name, shortenedUrl: (all.length + 1) });
    const {originalUrl, shortenedUrl} = createdUrl
    res.json({originalUrl, shortenedUrl});

  }
});

