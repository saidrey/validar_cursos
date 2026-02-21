FROM node:20-alpine

WORKDIR /app

RUN npm install -g @angular/cli@18

COPY package*.json ./

EXPOSE 4200

CMD sh -c 'if [ ! -f angular.json ]; then ng new . --skip-install --routing --style=css --skip-git --standalone && npm install; fi && npm start'
