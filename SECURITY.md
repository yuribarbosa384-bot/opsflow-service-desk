# Security Policy

## Supported Scope

This repository is a public portfolio project and the `main` branch is the only supported version.

The GitHub Pages demo uses demonstration data. The local API and SQLite database are intended for development and portfolio review, not production use. Treat any secret, credential, private token, or real operational data committed here as a security incident.

## Reporting a Vulnerability

Please do not open a public issue with exploit steps, secrets, tokens, or private data.

Use GitHub's private vulnerability reporting flow for this repository when available. If that is not available, contact the maintainer through the public GitHub profile and share only a short, non-sensitive summary until a private channel is agreed.

Include:

- A short description of the issue.
- Affected app, package, API route, dependency, or workflow.
- Reproduction steps using demo data only.
- Potential impact.
- Suggested fix, if you already have one.

## Response Expectations

- Initial triage target: 7 days.
- Confirmed dependency, API validation, or CI/CD issues are prioritized before feature work.
- Public disclosure should wait until a fix or mitigation is available.

## Out of Scope

- Automated reports without a reproducible impact.
- Social engineering.
- Denial-of-service testing against GitHub Pages or third-party services.
- Findings that depend on changing a user's local machine outside the application.
