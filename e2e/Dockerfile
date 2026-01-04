# Use the official Nginx base image
FROM nginx:1.25.3

# Copy your project's build artifacts into the Nginx web root.
# The `dist` directory on your host machine will be mounted here.
# For now, this is a placeholder.
# In a real project, this would be a COPY command.
# For local dev, a volume mount is better.
# COPY ./dist /usr/share/nginx/html

# Copy the Nginx configuration file
COPY ./test-nginx.conf /etc/nginx/nginx.conf

# Copy the SSL certificate and key
# These will be mounted from the host, but having them in the Dockerfile
# provides a default for environments without volumes.
# COPY ./certs/my-cdn.crt /etc/nginx/certs/my-cdn.crt
# COPY ./certs/my-cdn.key /etc/nginx/certs/my-cdn.key