# Dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

RUN npm run build

CMD [ "npm", "run", "preview" ]