FROM mhart/alpine-node:latest

RUN mkdir -p /graphql
WORKDIR /graphql

# copy paste express code
# alternatively can pull directly from git
COPY . ./

# npm install
RUN npm install

# start the server
EXPOSE 5050
