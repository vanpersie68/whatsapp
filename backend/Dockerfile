FROM node:16.17.0

WORKDIR /backend

COPY . .

RUN npm i --registry=https://registry.npmmirror.com

EXPOSE 8000

CMD npm run start