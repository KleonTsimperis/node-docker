`docker --help`
`docker build -t node-app-image .` to build an image
`docker run -p 3000:3000 -d --name node-app node-app-image` to run a built image
`docker rm node-app -f` to delete a specific container, the -f flat will delete even if running. Pass last flag as `-fv` to remove volume associated with the container.
`docker rmi d1e38b0f7705 21180f6e1801` to delete an image, or multiple
`docker container ls`, `docker image ls`, `docker volume ls` to list relevant info
`docker volume prune` || `docker image prune` to remove all volumes || images except if there is a volume in an active container

`docker image ls` to see all images

`docker exec -it node-app bash` => `ls` => find file you want to see and cat index.js. `exit` to exit from console

With volumes we can persist state. When we add code to the src code of the container, we would need to stop the container and re run it. There is a way to sync the files from the local machine to the container. The type of volume we use, is called `bind mount` which allows the sync from local machine to a folder in your docker container.

`docker run -d -v $(pwd):/app -p 3000:3000 --name node-app node-app-image` => the `-v` is for the volume and we select from where to copy (`$(pwd)`) to : (`/app`)
With the command above we syncing. pwd to /app. So if we were to delete node_modules, it would cause an issue. We can prevent that with an additional `-v` flag:
`docker run -d -v $(pwd):/app -v /app/node_modules -p 3000:3000 --name node-app node-app-image`. So bind mount can sync all the rest but can't touch the node_modules folder.

To pass an env variable add the flag --env or -e:
`docker run -d -v $(pwd):/app -v /app/node_modules --env PORT=4000 -p 3000:4000 --name node-app node-app-image`. This ovewrides the `PORT` from the Dockerfile.

But if we have several env variables we should add a file `.env` and then provide the path to that file:
`docker run -d -v $(pwd):/app -v /app/node_modules --env-file ./.env -p 3000:4000 --name node-app node-app-image`

To check all environment variables: `docker exec -it node-app bash` => `printenv`

=====

Everything up until this point was before adding the `docker-compose.yml` file. Hence:
version: '3'
services: services is another name for containers
node-app: so this is our node-app container and can take any name. `build`, `ports`, `volumes`, `environment` are related to that service/container
build: .
ports: - "3000:3000"
volumes: - ./:/app - /app/node_modules
environment: - PORT=3000

With the file in place, `docker-compose up -d --build`. We need the `--build`, otherwise it will just run the container. If a changes has been made to the source code, without the flag, it will run a stale container. We can check what is created `docker image ls` that the image created is `node-docker_node-app`. `reponame_string-below-services`.
To remove `docker-compose down -v`. The `-v` flag is to remove anonymous volumes

=====

Up to this point there was just one `docker-compose.yml`. From this point forward it has been renamed to `docker-compose.backup.yml` but we can run all of the above commands
by removing the `docker-compose(param).yml` files are not in place. The commands from this point forward, are with the multiple docker-compose files (shared, dev, prod).
To run the base file and the one of dev/prod: `docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d`. The `-f` stands for file. To delete current container
`docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v`

Note: If we run the yml file related to production, and me make a change into the `index.js` file, notice that the running server with nodemon will not update the changes. That is because in the `docker-compose.prod.yml` we don't have the bind mount. So now, for prod, in order to see the changes from the `index.js` we have to force a new build with the `--build` flag E.g. `docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build`

=====

The `npm install` command inside `Dockerfile` will install all dependencies and not distinguis between dev depedencies and normal dependencies. E.g. we don't need `nodemone` in production. See the description in `passingargs.png`.

=====

After we install `mongo` we can log in by `docker exec -it node-docker-mongo-1 bash` => `mongo -u "sanjeev" -p "mypassword"` or this can be onelined:
`docker exec -it node-docker-mongo-1 mongo -u "sanjeev" -p "mypassword"`
While inside mongo:
`db` will show current active db
`use mydb` will create a the mydb database and switch to it
`show dbs` will show all dbs with a record. Now, while at the `mydb` insert an entry
`db.books.insert({"name": "harry potter"})` and find all entries
`db.books.find()`
Now `show dbs`, will show the new db since it has an entry. Type `exit` to exit. The db contains data and can persist it.
NOTE: If we tear down `docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v` as before, the `-v` flag will delete all volumes (named and anonymous), and all persisted data. So to tear down and persist the data run the above comand WITHOUT `-v`. But as long as we run the `docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d` and then `docker volume prune`, it will remove all unused volumes but NOT the ones from the running container.

To connect to the DB from the node app: `docker logs node-docker-node-app-1`

=====

Currently there are 2 services in the docker-compose (node-app & mongo). If we want to run the both, then as usual: `docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d`. To run only node-app:
`docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d node-app`. But if `node-app` has dependencies (such in this case) we need to pass the `--no-deps` flag:
`docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --no-deps node-app`

=====

If we install a dependency, due to:
volumes:

- /app/node_modules
  Which is an anonymous volume, we need to rebuild with the `-V` / `--renew-anon-volumes`. Hence: `docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build -V`. Otherwise we tear it `down` and `--build` again without the `-V`

=====

NGINX
To open a second instance of our node-app:
`docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --scale node-app=2`
