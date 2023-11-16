## https://nodejs.org/en/docs/guides/nodejs-docker-webapp
## https://hub.docker.com/_/node
# 75Mb RAM and 290MB
FROM node:20-alpine
ENV NODE_ENV production
WORKDIR /app
# Install app dependencies
COPY package*.json ./
RUN npm ci --omit=dev

USER node
COPY --chown=node:node config/production.json5 config/production.json5
COPY --chown=node:node db/dev-db.sqlite db/dev-db.sqlite
COPY --chown=node:node js js/
COPY --chown=node:node views views/
COPY --chown=node:node ruda-err.log ruda-err.log

# EXPOSE 2333
CMD [ "node", "js/server.js" ]