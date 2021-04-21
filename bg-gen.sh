#!/bin/bash

cd bg-src
# set -x
set -e

for file in `find -iname "*.jpg"`; do
	echo "== $file =="
	basename="$(basename -- $file)"
	convert "$file" -auto-orient -resize 500x500 -quality 50 -strip -blur 0x5 "../web/bg/${basename%.*}.jpg"
done

