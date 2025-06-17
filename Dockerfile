# build stage
FROM node:20.16.0-alpine AS build

# libs are needed to build the masterportal
RUN apk update && apk add --no-cache --virtual .gyp \
    make \
    g++ \
    pkgconfig \
    pixman-dev \
    cairo-dev \
    pango-dev \
    python3 \
    libc6-compat \
    git

WORKDIR /masterportal

ARG MP_VERSION=3.3.2

RUN git clone https://geowerkstatt-hamburg@bitbucket.org/geowerkstatt-hamburg/masterportal.git . && git checkout v${MP_VERSION}
COPY addons addons
# Always use version as folder name
RUN sed -i 's/return folderName;/return stableVersionNumber;/g' devtools/tasks/getMastercodeVersionFolderName.js
RUN npm ci && echo "" | npm run build

# webserver stage
FROM nginx:1.28.0-alpine-slim

ARG GIT_COMMIT
ARG APP_VERSION

LABEL org.opencontainers.image.authors="terrestris GmbH & Co. KG <info@terrestris.de>"
LABEL org.opencontainers.image.source="https://code.terrestris.de/warendorf/masterportal-addons"
LABEL org.opencontainers.image.description="The masterportal for Warendorf"
LABEL org.opencontainers.image.licenses="BSD-2-Clause"
LABEL org.opencontainers.image.revision=$GIT_COMMIT
LABEL org.opencontainers.image.version=$APP_VERSION

COPY --from=build /masterportal/dist /usr/share/nginx/html/portal
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
