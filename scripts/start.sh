cd /usr/Apps/Parsify/client/

#INSTALL CLIENT DEPENDENCIES IF NOT EXISTS

if ! [ -d "/usr/Apps/Parsify/client/node_modules" ]; then
  echo "Empty Client nodes_modules"
  npm install --unsafe-perm
fi

# BUILD CLIENT APP
npm run build

# DEPLOYMENT
rm -rf /var/www/html/parsify
mkdir /var/www/html/parsify
cp -r ./build/* /var/www/html/parsify
cp ./.htaccess /var/www/html/parsify


#SERVER DEPENDENCIES
cd /usr/Apps/Parsify/server/

if ! [ -d "/usr/Apps/Parsify/server/node_modules" ]; then
  echo "Empty nodes_modules"
  npm install --unsafe-perm
fi

# START SERVER
npm run start --unsafe-perm=true --allow-root