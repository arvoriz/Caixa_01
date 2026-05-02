ARG RUBY_VERSION=3.3
FROM ruby:${RUBY_VERSION}-alpine AS base

RUN apk add --no-cache \
  build-base \
  postgresql-dev \
  yaml-dev \
  nodejs \
  yarn \
  tzdata \
  git \
  curl \
  bash

RUN gem install rails -v '~> 7.2' --no-document

WORKDIR /app

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# --- Development ---
FROM base AS development

COPY . .

EXPOSE 3000
ENTRYPOINT ["entrypoint.sh"]
CMD ["rails", "server", "-b", "0.0.0.0"]

# --- Production ---
FROM base AS production

ENV RAILS_ENV=production \
    BUNDLE_WITHOUT=development:test

COPY . .
RUN bundle install --jobs 4 --retry 3

COPY entrypoint.production.sh /usr/local/bin/entrypoint.production.sh
RUN chmod +x /usr/local/bin/entrypoint.production.sh

EXPOSE 3000
ENTRYPOINT ["entrypoint.production.sh"]
CMD ["rails", "server", "-b", "0.0.0.0"]
