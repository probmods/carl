# Carl - Continuous Actor/Reasoner/Learner

Requirements:

    mongodb
    babel-node (npm install -g babel-cli)

All of the below takes places in `src/`.

Install:

    scripts/install.sh

Adjust `carl/common/settings.js`.Run the type checker in watch mode:

    watch --color "node_modules/flow-bin/vendor/flow status --color always"

Run all servers:

    babel-node carl/main.js

Run multiple learners (for LDA; using 7 processes here):

    scripts/parallel-learn.sh 7

I recommend using [dtach](http://dtach.sourceforge.net/) for this purpose:

    dtach -c /tmp/learn.sock scripts/parallel-learn.sh 7

Then you can detach from the learners via `ctrl-\` and resume later:

    dtach -a /tmp/learn.sock

Run tests:

    babel-node tests/run-all.js