# Use a supported LTS Node.js version for building the React app
FROM node:20 as builder

ARG VITE_SOCKET_SERVER_URL
ENV VITE_SOCKET_SERVER_URL=$VITE_SOCKET_SERVER_URL

# Set the working directory for the build stage
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock/pnpm-lock.yaml)
# before installing dependencies to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Run the build command to generate static files in the 'dist' folder
RUN npm run build

# --- Production Stage ---
# Use a lightweight Nginx image for serving the static files
FROM nginx:alpine

# Copy the built static files from the builder stage into the Nginx html directory
# The default Nginx root is /usr/share/nginx/html
COPY --from=builder /app/dist /usr/share/nginx/html

# Remove the default Nginx configuration file
RUN rm /etc/nginx/conf.d/default.conf

# Copy your custom Nginx configuration file into the container
# Assuming your nginx.conf is in the same directory as your Dockerfile
COPY nginx.conf /etc/nginx/conf.d/

# Expose port 80 to the outside world
EXPOSE 80

# Command to run Nginx when the container starts
CMD ["nginx", "-g", "daemon off;"]
