FROM nginx:alpine
COPY assets/ /usr/share/nginx/html/assets/
COPY *.html /usr/share/nginx/html/
COPY robots.txt /usr/share/nginx/html/robots.txt
COPY sitemap.xml /usr/share/nginx/html/sitemap.xml
COPY admin/ /usr/share/nginx/html/admin/
COPY config/ /usr/share/nginx/html/config/
COPY core/ /usr/share/nginx/html/core/
COPY ui/ /usr/share/nginx/html/ui/
COPY modules/ /usr/share/nginx/html/modules/
COPY vendor/ /usr/share/nginx/html/vendor/
COPY docs/ /usr/share/nginx/html/docs/
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
