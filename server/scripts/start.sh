cd /usr/Apps/Parsify

if [ -z "$(ls -A /usr/Apps/Parsify/node_modules)" ]; then
  echo "Empty nodes_modules"
  npm install
fi

npm run start --unsafe-perm=true --allow-root
