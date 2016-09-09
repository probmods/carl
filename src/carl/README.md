# Carl - Continuous Actor/Reasoner/Learner

Requirements:

    mongodb

Install:

    npm install
    cd common; npm install; cd ..
    cd store; npm install; cd ..

Adjust `common/settings.js`.

Run the type checker in watch mode:

    watch --color "node_modules/flow-bin/vendor/flow status --color always"

Run all servers:

    babel-node main.js