# chgov-brprotokolle-frontend

- [chgov-brprotokolle](https://github.com/SwissFederalArchives/chgov-brprotokolle)
  - [chgov-brprotokolle-server](https://github.com/SwissFederalArchives/chgov-brprotokolle-server)
  - [chgov-brprotokolle-markdown](https://github.com/SwissFederalArchives/chgov-brprotokolle-markdown)
  - **[chgov-brprotokolle-frontend](https://github.com/SwissFederalArchives/chgov-brprotokolle-frontend)** :triangular_flag_on_post:
  - [chgov-brprotokolle-mirador-ocr-helper](https://github.com/SwissFederalArchives/chgov-brprotokolle-mirador-ocr-helper)

# Context

This software is an open-source and web-based viewer for [IIIF](https://iiif.io/).

# Architecture and components

It is focused on tree views but also works with single manifests.
The viewer was developed for the Archival IIIF Server, but also works with any other IIIF server.

* [IIIF Image API 2 & 3](https://iiif.io/api/image/3.0/)
* [IIIF Presentation API 2 & 3](https://iiif.io/api/presentation/3.0/)
* [IIIF Authentication API](https://iiif.io/api/auth/1.0/)
* [IIIF Search API](https://iiif.io/api/search/1.0/)


# First steps

## Preparations

- Install [Node.js](https://nodejs.org/en/)
- Install [NVM](https://github.com/nvm-sh/nvm)
- Install [yarn](https://yarnpkg.com)

## Install

1. Install correct Node version defined in `.nvmrc`
```
nvm install
```
2. Using the correct Node version
```
nvm use
```
3. Install yarn globally for given node version
```
npm i -g yarn
```
4. Install Node dependencies
```
yarn
```
5. Define a proper `.env` by using `.env.example` as reference.

## Static build

- Variant "specific": This build has to be run, if we want the content of .env to be compiled into `./public/config.json`

```
yarn build
```
- Variant "generic": This build job has to be run, if the environment configuration file (`./public/config.json`) needs to be left as it is.

```
yarn build:generic
```

# Customization

## General
- Make sure your `.env` file is properly defined

## Run tests
- There currently are no automated tests available.

## Execute
- Start development process in watch-mode
```
yarn start
```

# Authors

- [Schweizerisches Sozialarchiv](https://www.sozialarchiv.ch/)
- [4eyes GmbH](https://www.4eyes.ch/)

# License

The MIT License (MIT), see [LICENSE](LICENSE)

# Contribute

This repository is a copy which is updated regularly - therefore contributions via pull requests are not possible. However, independent copies (forks) are possible under consideration of the The MIT license.

# Contact

- For general questions (and technical support), please contact the Swiss Federal Archives by e-mail at bundesarchiv@bar.admin.ch.
- Technical questions or problems concerning the source code can be posted here on GitHub via the "Issues" interface.
