### Building and running your application

### Creating a docker image
To create a docker image, open a terminal in your project folder and write the following command
`docker build --pull --rm -f "Dockerfile" -t aq54:latest  .`

`-t`: Tag (if not specified, docker will take "latest" by default)
`-f`: File (Write the path to your Dockerfile)
`--pull` :
`--rm` :

### Running a docker container

`docker run -d -p 8080:80 aq54:latest`

`-d` : 
`-p` :
