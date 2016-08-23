/* const http = require('http');

   const hostname = '127.0.0.1';
   const port = 4000; */


const MongoClient = require('mongodb').MongoClient

const mongoURL = 'mongodb://localhost:27017/sampleme';


MongoClient.connect(mongoURL, (err, db) => {
  if (err) {
    console.error(`Error connecting to MongoDB: ${err}`);
  }
  console.log("[store] connected succesfully to mongo db");
  const collection = db.collection('users');
  const data = [
    {name: "alice"},
    {name: "bob"}
  ];
  collection.insertMany(data, (err, result) => {
    console.log(result);
  });
  db.close();
});
