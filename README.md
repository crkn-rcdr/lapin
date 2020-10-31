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

## File structure and request flow

`lapin` exposes all of its routes within the `/v1` namespace, for the possible eventuality that we're going to need API versioning for this service.

Developing new API calls in `lapin` concerns itself with three directories under `src/`.

- `src/resources`: functionality for sending data to and retrieving data from external resources. If we, for example, want to connect to Swift with this service, add generic Swift connectivity code to a `swift.js` file in this directory.
- `src/models`: functionality for manipulating logical data models, which may or may not correspond to database models. Slug, for instance, contains code that works for both Collection and Manifest slugs. `src/models/_util` contains utility methods that might be referenced by multiple models.
- `src/routes`: API route definitions. Each file acts as a mini-router for each route "subdirectory", e.g. `manifest.js` contains all of the `/v1/manifest/` routes. See `src/routes.js` for how the full Express service uses all of the routes.

Routes are defined in `src/routes` but the intent is for the bulk of `lapin`'s business logic to be found in `src/models`. This might change in the future as `src/routes` contains a fair bit of boilerplate.

Use the error classes defined in `src/errors.js` to throw HTTP errors, which are handled correctly by middleware. Some error classes have room to specify the message to return.

## Integration testing

Run `yarn run docker:test` to run the test suite in `test/`. The test suites creates and deploys an instance of Kivik based on the [crkn-rcdr/Access-Platform](https://github.com/crkn-rcdr/Access-Platform) specification (provided as a submodule in `spec/`). Please write tests for every new or updated route! An updated guide on how to do this is forthcoming once we've settled on a few conventions.
