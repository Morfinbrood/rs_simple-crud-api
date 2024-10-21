# simple-crud-api

# Assignment: CRUD API

## Description

Your task is to implement simple CRUD API using in-memory database underneath.

## Technical requirements

- Task can be implemented on Javascript or Typescript
- Only `nodemon`, `dotenv`, `cross-env`, `typescript`, `ts-node`, `ts-node-dev`, `eslint` and its plugins, `webpack-cli`, `webpack` and its plugins, `prettier`, `uuid`, `@types/*` as well as libraries used for testing are allowed
- Use 22.x.x version (22.9.0 or upper) of Node.js
- Prefer asynchronous API whenever possible

## How to install

npm i

## How to start

use scripts for start:
npm run start:dev
npm run start:prod
npm run start:multi
npm run test

For easy testing you able to import rs_simple_crud_app.postman_collection.json in postman

## How to use

1. collection in memory and after start is empty [] - according to requirements
2. To add new User
   POST http://localhost:4000/api/users
   with body like
   {
   "username": "testName",
   "age": 38,
   "hobbies": ["reading", "gaming", "hiking"]
   }
3. copy new userId in responce or get it in
   GET http://localhost:4000/api/users/280586fa-d2da-4a8e-91d7-2cb200492d97 <-put your userID
4. for update user
   PUT http://localhost:4000/api/users/280586fa-d2da-4a8e-91d7-2cb200492d97 <-put your userID
   Attention: will update only field that you want update like, other fields not change
   {
   "age": 39,
   "hobbies": ["reading"]
   }
5. for delete user
   DELETE http://localhost:4000/api/users/661f68fa-dfcd-49ff-acc9-db661450c5f0 <-put existed userID to delete
6. for get list of users GET http://localhost:4000/api/users

7. I disable direct requests to workers like
   GET http://localhost:4001/api/users -> {"message": "Direct access to worker is forbidden."}
   workers get routes only from loadBalancer
8. For LoadBalancer state of db should be consistent between different workers
9. You able looks what going on in logs
10. For testLoadBalancer pls wait while all workers start own server (LOGS)
11. enjoy it!)

## Implementation details

1. Implemented endpoint `api/users`:
   - **GET** `api/users` is used to get all persons
     - Server should answer with `status code` **200** and all users records
   - **GET** `api/users/{userId}`
     - Server should answer with `status code` **200** and record with `id === userId` if it exists
     - Server should answer with `status code` **400** and corresponding message if `userId` is invalid (not `uuid`)
     - Server should answer with `status code` **404** and corresponding message if record with `id === userId` doesn't exist
   - **POST** `api/users` is used to create record about new user and store it in database
     - Server should answer with `status code` **201** and newly created record
     - Server should answer with `status code` **400** and corresponding message if request `body` does not contain **required** fields
   - **PUT** `api/users/{userId}` is used to update existing user
     - Server should answer with` status code` **200** and updated record
     - Server should answer with` status code` **400** and corresponding message if `userId` is invalid (not `uuid`)
     - Server should answer with` status code` **404** and corresponding message if record with `id === userId` doesn't exist
   - **DELETE** `api/users/{userId}` is used to delete existing user from database
     - Server should answer with `status code` **204** if the record is found and deleted
     - Server should answer with `status code` **400** and corresponding message if `userId` is invalid (not `uuid`)
     - Server should answer with `status code` **404** and corresponding message if record with `id === userId` doesn't exist
2. Users are stored as `objects` that have following properties:
   - `id` — unique identifier (`string`, `uuid`) generated on server side
   - `username` — user's name (`string`, **required**)
   - `age` — user's age (`number`, **required**)
   - `hobbies` — user's hobbies (`array` of `strings` or empty `array`, **required**)
3. Requests to non-existing endpoints (e.g. `some-non/existing/resource`) should be handled (server should answer with `status code` **404** and corresponding human-friendly message)
4. Errors on the server side that occur during the processing of a request should be handled and processed correctly (server should answer with `status code` **500** and corresponding human-friendly message)
5. Value of `port` on which application is running should be stored in `.env` file
6. There should be 2 modes of running application (**development** and **production**):
   - The application is run in development mode using `nodemon` or `ts-node-dev` (there is a `npm` script `start:dev`)
   - The application is run in production mode (there is a `npm` script `start:prod` that starts the build process and then runs the bundled file)
7. There could be some tests for API (not less than **3** scenarios). Example of test scenario:
   1. Get all records with a `GET` `api/users` request (an empty array is expected)
   2. A new object is created by a `POST` `api/users` request (a response containing newly created record is expected)
   3. With a `GET` `api/user/{userId}` request, we try to get the created record by its `id` (the created record is expected)
   4. We try to update the created record with a `PUT` `api/users/{userId}`request (a response is expected containing an updated object with the same `id`)
   5. With a `DELETE` `api/users/{userId}` request, we delete the created object by `id` (confirmation of successful deletion is expected)
   6. With a `GET` `api/users/{userId}` request, we are trying to get a deleted object by `id` (expected answer is that there is no such object)
8. There could be implemented horizontal scaling for application, there should be `npm` script `start:multi` that starts multiple instances of your application using the Node.js `Cluster` API (equal to the number of available parallelism - 1 on the host machine, each listening on port PORT + n) with a **load balancer** that distributes requests across them (using Round-robin algorithm). For example: available parallelism is 4, `PORT` is 4000. On run `npm run start:multi` it works following way

- On `localhost:4000/api` load balancer is listening for requests
- On `localhost:4001/api`, `localhost:4002/api`, `localhost:4003/api` workers are listening for requests from load balancer
- When user sends request to `localhost:4000/api`, load balancer sends this request to `localhost:4001/api`, next user request is sent to `localhost:4002/api` and so on.
- After sending request to `localhost:4003/api` load balancer starts from the first worker again (sends request to `localhost:4001/api`)
- State of db should be consistent between different workers, for example:
  1. First `POST` request addressed to `localhost:4001/api` creates user
  2. Second `GET` request addressed to `localhost:4002/api` should return created user
  3. Third `DELETE` request addressed to `localhost:4003/api` deletes created user
  4. Fourth `GET` request addressed to `localhost:4001/api` should return **404** status code for created user
