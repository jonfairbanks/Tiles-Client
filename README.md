<h1 align="center">
  Tiles
</h1>

<img src="https://raw.githubusercontent.com/Fairbanks-io/tiles-client/master/logo.png" alt="tiles-logo"/>

![Docker Cloud Automated build](https://img.shields.io/docker/cloud/automated/fairbanksio/tiles-client.svg)
![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/fairbanksio/tiles-client.svg)
![GitHub top language](https://img.shields.io/github/languages/top/Fairbanks-io/tiles-client.svg)
![Docker Pulls](https://img.shields.io/docker/pulls/fairbanksio/tiles-client.svg)
![GitHub last commit](https://img.shields.io/github/last-commit/Fairbanks-io/tiles-client.svg)

<p align="center">Pixel art chatrooms with your friends!</p>

## Getting Started

#### Prerequisites

The following will need to be installed before proceeding:

- Node v8+
- Mongo DB
- Nginx
- [Tiles API](https://github.com/Fairbanks-io/tiles-api)

#### Clone the Project

```sh
# Clone it
git clone https://github.com/Fairbanks-io/tiles-client.git
cd tiles-client/
```

#### Setup Backend API

The frontend requires the Tiles API to be running for saving drawings and managing chats. To setup the backend API, please checkout the [Tiles API readme](https://github.com/Fairbanks-io/tiles-api/blob/master/README.md).

#### Install & Launch the Frontend

```sh
npm install
npm start
```

The Tiles UI should now be available at http://localhost:3000

#### Nginx

The following is an Nginx configuration block for both frontend and backend:

```sh
server {
    listen               443  ssl;
    ssl                  on;
    ssl_certificate fullchain.pem;
    ssl_certificate_key privkey.pem;
    server_name    tiles.mysite.io;
    large_client_header_buffers 4 8k;
    location / {
        proxy_pass      http://127.0.0.1:3000/;
        # Upgrade for Websockets
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    location /socket.io/ {
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_pass http://127.0.0.1:4001/socket.io/;
    }
    location /tiles {
        proxy_pass      http://127.0.0.1:4001/tiles;
        # Upgrade for Websockets
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

#### Docker

The Tiles UI can also be launched via Docker using the following example:

```sh
docker build -t Fairbanks-io/tiles-client .
docker run -d -p 3000:3000 --name 'tiles-client' Fairbanks-io/tiles-client
```
