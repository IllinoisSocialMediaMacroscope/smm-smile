# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Fixed
- Github action to auto generate docker container [#93](https://github.com/ncsa/standalone-smm-smile/issues/93)

### Added
- Enable email sending [#72](https://github.com/ncsa/standalone-smm-smile/issues/72)

## [0.2.9]
### Added
- Environment variable to turn Clowder on and off [#86](https://github.com/ncsa/standalone-smm-smile/issues/86)
- Replace Twitter API v1 with X (Twitter) API v2 and implement OAUTH2 [#10](https://github.com/ncsa/standalone-smm-smile/issues/10)

## [0.2.8] - 2023-07-20
### Changed
- Twitter stop supporting v1.1 endpoints hence disable integration with Twitter

## [0.2.7] - 2023-06-08
### Fixed
- typo in import config file [#68](https://github.com/ncsa/standalone-smm-smile/issues/68)
- re-enable Twitter 

## [0.2.6] - 2023-06-01
### Changed
- environment variables related to minio from host_ip to minio_url [#62](https://github.com/ncsa/standalone-smm-smile/issues/62)
- temporarily disable Twitter [#65](https://github.com/ncsa/standalone-smm-smile/issues/65)

## [0.2.5] - 2022-05-11
### Changed
- disable and hide image crawling and reddit comment collections [#56](https://github.com/ncsa/standalone-smm-smile/issues/56)
- enable connection to clowder [#53](https://github.com/ncsa/standalone-smm-smile/issues/53)

### Fixed
- correct versioning for github action container building [#54](https://github.com/ncsa/standalone-smm-smile/issues/54)

## [0.2.4] - 2023-04-28
### Changed
- updated footer [#34](https://github.com/ncsa/standalone-smm-smile/issues/34)
- update citation [#33](https://github.com/ncsa/standalone-smm-smile/issues/33)
- disable hotkeys for now [#48](https://github.com/ncsa/standalone-smm-smile/issues/48)

### Added
- use import keywords to construct tag [#32](https://github.com/ncsa/standalone-smm-smile/issues/32)

### Fixed
- authorize reddit icon not clickable [#35](https://github.com/ncsa/standalone-smm-smile/issues/35)
- top bar doesn't show user account on analysis page [#31](https://github.com/ncsa/standalone-smm-smile/issues/31)
- delete data doesn't delete search tag [#28](https://github.com/ncsa/standalone-smm-smile/issues/28)
- reddit search dry run increase result number [#29](https://github.com/ncsa/standalone-smm-smile/issues/29)

## [0.2.3] - 2023-04-20
### Changed
- register new mailing list instead of srti lab [#12](https://github.com/ncsa/standalone-smm-smile/issues/12)
- add github action to automatic build and publish [#22](https://github.com/ncsa/standalone-smm-smile/issues/22)
- renamed minio related environment variable [#38](https://github.com/ncsa/standalone-smm-smile/issues/38)

## [0.2.2] - 2023-04-20
### Changed
- made Redis URL as environment variable [#16](https://github.com/ncsa/standalone-smm-smile/issues/16)
- convert s3 url to environment variable [#18](https://github.com/ncsa/standalone-smm-smile/issues/16=8)

## [1.2.8] - 2020-01-09
### Changed
- fix frontend bug on classification when click "split", "train", "predict" button

## [1.2.4] - 2019-11-07
### Changed
- use forever library to auto-restart servers when it fails
- populate more graphql errors back to SMILE server then to the browser
- fix bugs and change logic in search pagination
- update citation to the future generation computer publication

## [1.2.3] - 2019-10-25
### Changed
- UI interface change based on Hubzero usability report

### Added
- POST /dryRun endpoint to do a "pre" search instead of save the search results directly
- GET /citation endpoint to list the citation

## [1.2.2] - 2019-09-13
### Changed
- bugfix the urls schema type in twtTweetType.js from String to List

## [1.2.1] - 2019-08-20
### Changed
- Add ids to analysis output (hence rotate the aws lambda for NW, SA, PP)
- Add restrictions and hint text for upload user dataset

## [1.2.0] - 2019-07-26
### Added
- Add features to collect images from social media sources

### Changed
- Modify the Authorization page when search from social media data sources

## [1.1.9] - 2019-07-26
### Added
- Add sentiment classification using debiased word embedding algorithm

## [1.1.8] - 2019-06-24
### Added
- Add Gensim LDA topic modeling as a tool in SMILE analytics

## [1.1.7] - 2019-06-17
### Changed
- Add an identity check on the server side to check if the requested path (from frontend) 
to access a certain s3 folder matches the user's identity

## [1.1.6] - 2019-05-28
### Added
- Add SVC, Decision Tree, and Adaboost classifier alogrithm for text classification

### Changed
- Highlight the pipeline download in the popup of text classification
- Fix UID bug in text classification

## [1.1.5] - 2019-05-21
### Added
- Add Twitter timeline as a datasource in GraphQL.

### Changed
- Query interface updated.

### Removed
- Search for twitter user feature removed.

