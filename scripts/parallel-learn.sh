#!/usr/bin/env bash

set -e

# Go to source directory
cd "$( dirname "${BASH_SOURCE[0]}" )/../src"

k=$1

for ((n=0;n<$1;n++)); do
    babel-node carl/learn/learn.js &
    sleep 0.5s
done

wait
