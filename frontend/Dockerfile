FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/default.conf.template
COPY docker-entrypoint.sh /start-nginx.sh
RUN chmod +x /start-nginx.sh
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["/start-nginx.sh"]
