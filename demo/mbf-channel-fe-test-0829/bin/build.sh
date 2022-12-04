#!/bin/bash
# 1 module 2 versiopn 3 build_number

mkdir build
cp -r dist build/$1
echo -e "name=$1\nversion=$2\nos=h5\nbuildTime=$(date '+%Y-%m-%d %H:%M:%S')" > build/$1/readme.json
cd build
tar -zcvf $1-h5-$3.tar.gz $1

