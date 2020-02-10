FROM node:8 as ssearch-ui
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn
COPY . ./
RUN yarn build

FROM nginx:1.12-alpine
COPY --from=ssearch-ui /app/build /usr/share/nginx/html
EXPOSE 7982
CMD ["nginx", "-g", "daemon off;"]