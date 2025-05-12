# Use an official Python runtime as a parent image
FROM node:20-alpine
# Set work directory
WORKDIR /app
COPY package*.json ./
COPY numerator-api/package*.json ./
COPY payments-api/package*.json ./
COPY config/db.json ./

RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
