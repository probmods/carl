to start the server, first make sure you're using node v4, then do:

~~~~
source sendgrid.env; node act.js
~~~~

to use, make a get request like this:

~~~~
/?uid=<uid>&question=<question>&time=<time>
~~~~

this will set up a cron job to run at time (a unix time)

for debugging, here is an alternate form that specifies relative time in seconds:

~~~~
/?uid=<uid>&question=<question>&delta=<delta>
~~~~
