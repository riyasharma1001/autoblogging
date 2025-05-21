#!/bin/bash
# search_connectToDB.sh
# This script searches for occurrences of "connectToDB" and
# "import { connectToDB }" in all .js and .jsx files in your project,
# excluding build output and third-party libraries.

echo "Searching for 'connectToDB' references in the project..."

# Search for any instance of connectToDB while excluding .next and node_modules directories
grep -RIn --include=\*.{js,jsx} --exclude-dir={.next,node_modules} "connectToDB" .

echo "-------------------------------------------------------------"
echo "Review the above output."
echo "Replace any occurrence of:"
echo "    import { connectToDB } from \"../utils/db\";"
echo "    await connectToDB();"
echo "with:"
echo "    import dbConnect from \"../utils/db\";"
echo "    await dbConnect();"
