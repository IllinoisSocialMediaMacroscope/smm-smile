FROM node:8

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Build for development
# RUN npm install

# If you are building your code for production
RUN npm install --only=production

# Bundle app source
COPY . .

EXPOSE 5050

CMD [ "npm", "start" ]