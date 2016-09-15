# Carl - Continuous Actor/Reasoner/Learner

Requirements:

    mongodb

Install:

    npm install
    cd carl
    cd common; npm install; cd ..
    cd store; npm install; cd ..
    cd learn; npm install; cd ..
    cd ..

Adjust `carl/common/settings.js`.

Run the type checker in watch mode:

    watch --color "node_modules/flow-bin/vendor/flow status --color always"

Run all servers:

    babel-node carl/main.js