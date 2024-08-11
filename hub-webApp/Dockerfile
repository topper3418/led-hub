FROM node:20

WORKDIR /hub-webapp

COPY package*.json ./

RUN npm install

RUN npm rebuild

COPY . . 

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
