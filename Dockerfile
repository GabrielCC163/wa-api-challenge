FROM node:lts-alpine

WORKDIR /usr/src/app/

COPY package*.json ./

RUN yarn install

COPY . .

COPY ./entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

ENTRYPOINT [ "/entrypoint.sh" ]