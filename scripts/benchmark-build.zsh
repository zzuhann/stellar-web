#!/bin/zsh

set -euo pipefail

output=$(mktemp)
trap 'rm -f "$output"' EXIT

rm -rf .next
/usr/bin/time -l npm run build 2>&1 | tee "$output"

size() {
  find .next/static/chunks -type f -name "*.$1" -exec wc -c {} + | awk 'END { print $1 + 0 }'
}

gzip_size() {
  find .next/static/chunks -type f -name "*.$1" -exec gzip -kc {} \; | wc -c | tr -d ' '
}

echo
echo "Build benchmark"
echo "  Build time:  $(awk '/ real / { print $1 "s" }' "$output" | tail -1)"
echo "  Max RSS:     $(awk '/maximum resident set size/ { print $1 " bytes" }' "$output" | tail -1)"
echo "  CSS files:   $(find .next/static/chunks -type f -name '*.css' | wc -l | tr -d ' ')"
echo "  CSS raw:     $(size css) bytes"
echo "  CSS gzip:    $(gzip_size css) bytes"
echo "  JS raw:      $(size js) bytes"
echo "  JS gzip:     $(gzip_size js) bytes"
