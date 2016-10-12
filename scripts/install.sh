#!/usr/bin/env bash

set -ex

# Go to source directory
cd "$( dirname "${BASH_SOURCE[0]}" )/../src"

# Install package manager
if hash yarn 2>/dev/null; then
    install="yarn"
else
    install="npm install"
fi


# Install root packages
eval $install

cd carl

# Install common packages
cd common
eval $install
cd ..

# Install store packages
cd store
eval $install
cd ..
