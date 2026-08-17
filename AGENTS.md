# Project context

This repository is the frontend.

The sibling workspace folder `PortfolioAppBE` is the Spring Boot backend
and must be used as the source of truth for:

- REST endpoint paths
- request/response DTOs
- validation rules
- domain naming
- error response structures

Do not modify the backend unless explicitly asked.

When implementing frontend API calls, inspect the backend controllers and DTOs first.
