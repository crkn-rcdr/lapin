FROM node:14.3.0-alpine3.11

WORKDIR /lapin
RUN chown -R node:node .

USER node

COPY --chown=node:node package.json yarn.lock ./

RUN if [ "$NODE_ENV" = "development" ]; \
  then yarn install --dev; \
  else yarn install; \
  fi

COPY --chown=node:node spec spec
COPY --chown=node:node src src

EXPOSE 8081
CMD yarn run start
