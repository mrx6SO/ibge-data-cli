# Step 1: Use a lightweight Node.js base image
FROM node:18-alpine AS base

# Define the working directory inside the container
WORKDIR /usr/src/app

# Copy the package manifest files
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Ensure the database directory exists for volume mounting
RUN mkdir -p /usr/src/app/src/database

# Run migrations to ensure the database schema is ready
RUN npm run knex:migrate

# Define the entrypoint to run the application.
# This allows passing commands like 'import-data' directly in 'docker run'.
ENTRYPOINT ["node", "src/app.js"]

# Default command to be executed if none is provided (displays help)
CMD ["--help"]