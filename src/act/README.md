to use, make a get request like this:

~~~~
/?uid=<uid>&question=<question>&time=<time>
~~~~

this will set up a cron job to run at time (a unix time)

for debugging, here is an alternate form that specifies relative time in seconds:

~~~~
/?uid=<uid>&question=<question>&delta=<delta>
~~~~
