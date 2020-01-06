FROM mhart/alpine-node:latest

RUN mkdir -p /www
WORKDIR /www

# copy paste express code
# alternatively can pull directly from git
COPY . ./

# npm install
RUN npm install

# patch the oauth library node_modules/oauth/lib/oauth.js, line 540 add: && extraParams["oauth_callback"]===undefined
COPY ./oauth.js ./node_modules/oauth/lib

# start the server
EXPOSE 8001
