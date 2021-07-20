#!/bin/bash
set -eu
D=$(dirname $0)
rm -rf $D/source/languageguide
mkdir $D/source/languageguide
cp -R $D/../rellr/doc/guide/* $D/source/languageguide
echo "Language Guide copied"
