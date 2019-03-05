FROM arafato/azurite:latest

ENTRYPOINT ["sh", "-c", "node /opt/azurite/bin/${executable} -l /opt/azurite/folder"]

RUN mkdir -p /usr/src/app/node_modules
WORKDIR /usr/src/app
COPY . /usr/src/app

RUN npm i --cache=.npmcache
RUN rm -rf .npmcache

ENV NODE_ENV production

EXPOSE 8080

CMD ["npm", "run", "start"]