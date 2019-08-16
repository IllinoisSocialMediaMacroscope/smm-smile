# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2019-08-26
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

