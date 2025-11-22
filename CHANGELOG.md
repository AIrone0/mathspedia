# Changelog

All notable changes to Mathspedia will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- MediaWiki migration from localStorage-based system
- MathspediaAuthority extension for authority-based editing
- MathspediaABTesting extension for A/B testing same-rank conflicts
- MathspediaMath extension for enhanced math features:
  - LaTeX support (via existing Math extension)
  - Custom color and size tags
  - Manim code blocks
  - Interactive JavaScript code blocks
  - External service embedding
- Migration script for transferring articles from old system
- GitHub repository setup
- Automatic deployment configuration

### Changed
- Migrated from pure client-side HTML/JS to MediaWiki-based system
- Database backend using MariaDB instead of localStorage

### Fixed
- PCRE limits for MediaWiki installation
- MariaDB TCP/IP connection configuration
- LocalSettings.php configuration

## [1.0.0] - 2025-11-22

### Added
- Initial MediaWiki installation
- Basic wiki functionality
- User authentication system
- Article creation and editing

