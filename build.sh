#!/bin/bash
set -eu

D=$(dirname $0)
rm -rf $D/build

$D/copy-language-guide.sh
$D/sphinx-build.sh
echo "OK"
