FROM node:14-alpine
ARG node_env
ENV NODE_ENV ${node_env}

WORKDIR /lapin
RUN chown -R node:node .

USER node

COPY --chown=node:node package.json yarn.lock ./

RUN yarn install

COPY --chown=node:node spec spec
COPY --chown=node:node test test
COPY --chown=node:node src src

EXPOSE 8081
CMD yarn run start
