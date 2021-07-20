#!/bin/bash
set -eu

D=$(dirname $0)
rm -rf $D/build

sphinx-build $D/source $D/build
