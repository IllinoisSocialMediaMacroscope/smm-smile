# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.3] - 04-20-2023
### Changed
- register new mailing list instead of srti lab [#12](https://github.com/ncsa/standalone-smm-smile/issues/12)

## [0.2.2] - 04-20-2023
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

