FROM node:12.18.3-alpine3.12

# Create /home/node/app/node_modules directory. Change ownership of /home/node/app
# and it's contents to the "node" user, for better security.
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

# Switch the user to the node user to ensure files are owned 
# by the node user for better security.
USER node

RUN npm install

# Copy the application files to the /app directory with appropriate ownership permissions.
COPY --chown=node:node . ./

# Make sure to build the next.js application
RUN npm run build

EXPOSE 3000

CMD [ "npm", "run", "start"]