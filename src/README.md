# Carl - Continuous Actor/Reasoner/Learner

Requirements:

    mongodb

All of the below takes places in `src/`.

Install:

    scripts/install.sh

Adjust `carl/common/settings.js`.

Run the type checker in watch mode:

    watch --color "node_modules/flow-bin/vendor/flow status --color always"

Run all servers:

    babel-node carl/main.js

Run tests:

    babel-node tests/run-all.js