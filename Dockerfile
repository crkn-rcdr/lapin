FROM node:14.3.0-alpine3.11
ARG node_env=production

WORKDIR /lapin
RUN chown -R node:node .

USER node

ENV NODE_ENV=$node_env

COPY --chown=node:node package.json yarn.lock ./

RUN if [ $NODE_ENV = "development" ]; \
  then yarn install --dev; \
  else yarn install; \
  fi

COPY --chown=node:node src ./

# Sets default server, which can be overridden at run time
ENV COUCH http://iris.tor.c7a.ca:5984

EXPOSE 8081
CMD yarn run start
