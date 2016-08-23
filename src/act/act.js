// var cron = require('node-cron');

// var task = cron.schedule('*/2 * * * * *', function(){
//   console.log('running a task every two seconds');
//   task.stop()
// });

const http = require('http')
const port = 3001

const requestHandler = (request, response) => {
  console.log(request.url)
  response.end('Hello Node.js Server!')
}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})
