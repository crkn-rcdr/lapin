# lapin -- Canadiana Access Platform API server

## Building

`lapin` has two build modes: `dev` and `prod`. Use the scripts in package.json to run them easily:

- `yarn run docker:dev`: builds the `lapin:dev` image and runs it in a container, with sensible volume/network defaults
- `yarn run docker:prod`: builds the `lapin:prod` image, ready for tagging and pushing to our docker repo

## Environment variables

`lapin` requires that the following environment variables are set:

- `NODE_ENV`: set to `development` to trigger stdout logging. set to `production` to avoid building `devDependencies`
- `COUCH`: an internal couch URL (i.e. in development, requires VPN access)
- `JWT_SECRET`: the JWT secret in use by [amsa](https://github.com/crkn-rcdr/amsa)

The following optional environment variable can be set:

- `AUTHLESS`: set this to anything, and `lapin` won't check for an Authorization header with a Bearer token.

The default docker-compose files set `NODE_ENV` and `AUTHLESS`. You will need to supply a `docker-compose.override.yml` file with `JWT_SECRET` and `COUCH` set. See `docker-compose.override.example.yml` for more.

## Current defaults and magic numbers

- `lapin` runs on port 8081, and this is the port that the Docker image exposes.
- Upon startup, `lapin` pings the CouchDB installation at `COUCH`. If CouchDB does not respond within 2 seconds, `lapin` aborts the connection attempt and exits with an error.
- Other requests to CouchDB have a 10 second timeout. This may prove troublesome for view requests if the view index hasn't been updated in a while. We may need to set `stale` on view requests for GET API requests, and change this for API requests that make changes to the database.

## Developing off of the API

`lapin` exposes a website built automatically from the API specification at [`/docs`](https://api.canadiana.ca/docs), as well as the API specification in JSON format at [`/spec`](https://api.canadiana.ca/spec).

## Integration testing

Run `yarn run docker:test` to run the test suite in `test/`.
