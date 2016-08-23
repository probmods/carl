const http = require('http');

const hostname = '127.0.0.1';
const port = 3001;


function serverError(response, msg) {
  console.error(msg);
  response.statusCode = 500;
  response.setHeader('Content-Type', 'text/plain');
  response.end(msg);
  return response;
}


const server = http.createServer((request, response) => {

  if (request.method !== 'POST') {
    const msg = `[perceive] got non-POST request: ${request.method}`;
    return serverError(response, msg);
  }

  var body = '';

  request.on('data', function (data) {
    body += data;
    if (body.length > 1e6) {
      request.connection.destroy();
    }
  });

  request.on('end', function () {
    const content = JSON.parse(body);  // make robust
    console.log(`[perceive] got content: ${body}`);
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/plain');
    response.end(`Got content: ${body}\n`);
  });
});

server.listen(port, hostname, () => {
  console.log(`[perceive] running at http://${hostname}:${port}/`);
});
