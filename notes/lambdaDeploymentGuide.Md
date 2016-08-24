WebPPL API deployment guide
===========================

Updating WebPPL lambda function
-------------------------------

While the API is static and just points to the lambda function, you'll need to redeploy the lambda function every time you want to, e.g., update webppl or return webppl output in a different format.

First, on the command line, call

```
cd lambda
make
```

which will locally install the version of webppl specified in `package.json` and bundle it up with `index.js` into a zip.

Next, go to the `code` tab of the callwebppl page on the lambda console, click "upload" and select the `Archive.zip` file that was just created.

Finally, hit the blue "Save and Test" button at the top to make sure nothing is broken.

Creating WebPPL lambda function
-------------------------------

The first time you use lambda, you need to actually configure the callwebppl function.

1. Skip the blueprint step.

2. On the "configure triggers" step, add "API Gateway" with the defaults, choosing "POST" for METHOD and "Open" for "Security".

3. On the "configure function" step, select "Upload a .ZIP file" and find the Archive.zip created earlier. Use the following properties (if using CoCoLab credentials, this should already exist):

* Runtime: Node.js 4.3
* Handler: index.handler
* Timeout: 1min 0sec
* Role: ??? 

4. Click the "Save and Test" button and provide {"program" : "flip(0.5)"} as the test event. You should get back something like "webppl returned: true".

Creating API
------------

I basically followed [this tutorial](http://docs.aws.amazon.com/apigateway/latest/developerguide/getting-started.html): the main trick is to use the POST method.

You should be able to test this in the "client" column on the left side of the console using {"program" : "flip(0.5)"} as the request body.

To deploy the API, go to "actions -> deploy API". This will give you the URL you'll use to make your POST request.

Calling API
-----------

Make a POST request to the URL you got above, which will look something like:

https://<unique-id>.execute-api.us-west-2.amazonaws.com/prod/null

with "Content-Type: application/json" appended to the header, and

{
  "program": "flip(0.5)"
}

in the request body.





