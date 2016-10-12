#!/usr/bin/env bash

set -ex

# Go to source directory
cd "$( dirname "${BASH_SOURCE[0]}" )/../src"

# Install package manager
npm install -g yarn

# Install root packages
yarn

cd carl

# Install common packages
cd common
yarn
cd ..

# Install store packages
cd store
yarn
cd ..
