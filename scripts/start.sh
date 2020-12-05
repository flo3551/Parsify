cd /usr/Apps/Parsify/server/

#INSTALL SERVER DEPENDENCIES IF NOT EXISTS
if ! [ -d "/usr/Apps/Parsify/server/node_modules" ]; then
  echo "Empty nodes_modules"
  npm install --unsafe-perm
fi

# BUILD CLIENT APP
cd /usr/Apps/Parsify/client
npm run build

# DEPLOYMENT
rm -rf /var/www/html/parsify
mkdir /var/www/html/parsify
cp -r ./build/* /var/www/html/parsify
cp ./.htaccess /var/www/html/parsify

# START SERVER
cd /usr/Apps/Parsify/server/
npm run start --unsafe-perm=true --allow-root