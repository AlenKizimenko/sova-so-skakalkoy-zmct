FROM nginx:alpine
COPY apps/site/public/ /usr/share/nginx/html/
EXPOSE 80
