FROM pkg.geely.com/docker/nginx:alpine

# USER root
# FROM nginx:alpine
# ARG ENV


COPY ./apps/demo/out /usr/share/nginx/html/
COPY ./prod.conf /etc/nginx/conf.d/default.conf

# USER 1001

RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 80
