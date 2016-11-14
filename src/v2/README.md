Run multiple webppl processes (for LDA; using 7 processes here):

    cd ~/carl/src/v2/
    ~/webppl/scripts/parallelRun lda.wppl 7 run-1 --require webppl-json

I recommend using [dtach](http://dtach.sourceforge.net/) for this purpose:

    dtach -c /tmp/lda.sock ~/webppl/scripts/parallelRun lda.wppl 1 real-1 --require webppl-json

Then you can detach from the processes via `ctrl-\` and resume later:

    dtach -a /tmp/lda.sock
