to use, make a get request like this:

~~~~
/?uid=<uid>&time=<time>&question=<question>
~~~~

this will set up a cron job to run at time (a unix time)

for debugging, here is an alternate form that specifies relative time in seconds:

~~~~
/?uid=<uid>&time=<time>&delta=<delta>
~~~~
