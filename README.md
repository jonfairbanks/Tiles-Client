docker build -t bsord/tiles-client .
docker run -d -p 3006:3000 --name 'Tiles-client' --restart unless-stopped bsord/tiles-client
# Tiles-Client
