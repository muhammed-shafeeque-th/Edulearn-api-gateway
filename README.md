# API Gateway

The **API Gateway** is the edge service of the Edulearn platform and the **single public entry point** for all client applications. It handles HTTP request routing, authentication, authorization, rate limiting, request validation, file upload orchestration, and communication with backend microservices through **gRPC**.

The gateway is built with **TypeScript**, **Node.js**, **Express**, and a modular layered architecture, and depends on **@edulearn/core** for shared platform infrastructure including logging, metrics, distributed tracing, Redis, Kafka, health checks, and observability utilities.

---

## Overview

The API Gateway sits between external clients and internal microservices, providing a secure, observable, and scalable interface to the Edulearn platform.

### Responsibilities

* HTTP API routing
* gRPC service communication
* JWT authentication
* Role-based authorization
* Redis-backed rate limiting
* Request validation
* File upload orchestration
* AWS S3 presigned URL generation
* Cloudinary profile image uploads
* Distributed tracing
* Metrics collection
* Structured logging
* Health checks

### Out of Scope

* User profile management (User Service)
* Authentication business logic (Auth Service)
* Course management (Course Service)
* Payment processing (Payment Service)
* Order lifecycle management (Order Service)
* Notification delivery (Notification Service)
* Real-time messaging (Chat Service)

---

# Architecture

The gateway follows a **layered edge architecture** that separates transport concerns, middleware, routing, service communication, and infrastructure.

## High-Level Architecture

```text
                    Web / Mobile Clients
                            │
                            ▼
                    API Gateway (HTTP)
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
       Auth Service     User Service    Course Service
            │               │               │
            ▼               ▼               ▼
      Payment Service   Order Service  Notification Service
                            │
                            ▼
                        Chat Service
```

### Request Pipeline

```text
Client Request
      │
      ▼
Security Middleware
      │
      ▼
Rate Limiting
      │
      ▼
Authentication
      │
      ▼
Authorization
      │
      ▼
Validation
      │
      ▼
Route Handler
      │
      ▼
gRPC Client
      │
      ▼
Microservice
```

---

# Technology Stack

| Category       | Technology                                          |
| -------------- | --------------------------------------------------- |
| Language       | TypeScript 5.x                                      |
| Runtime        | Node.js                                             |
| Framework      | Express.js                                          |
| Architecture   | Layered Modular Architecture                        |
| Transport      | HTTP / gRPC                                         |
| Cache          | Redis                                               |
| Messaging      | Kafka                                               |
| File Upload    | AWS S3 (Presigned URLs), Cloudinary                 |
| Authentication | JWT                                                 |
| Observability  | @edulearn/core (Winston, Prometheus, OpenTelemetry) |
| Deployment     | Docker, Kubernetes, Helm                            |

---

# Core Responsibilities

## Authentication Gateway

The gateway validates JWT access tokens and propagates authenticated identity to downstream services through **gRPC metadata**.

Features:

* JWT verification
* Token extraction
* Identity propagation
* Role propagation
* Correlation IDs

## Authorization

Role-based access control is enforced before requests reach internal services.

Supported roles:

* Student
* Instructor
* Admin

## Rate Limiting

Redis-backed rate limiting protects the platform from abuse.

Features:

* IP-based limiting
* User-based limiting
* Configurable quotas
* Burst handling
* Distributed enforcement

## File Upload Orchestration

### AWS S3

Used for course assets and large file uploads through **presigned URLs**.

Flow:

```text
Client
   │
   ▼
API Gateway
   │
   ▼
Generate Presigned URL
   │
   ▼
AWS S3
```

### Cloudinary

Used for profile images and media transformations.

Flow:

```text
Client
   │
   ▼
API Gateway
   │
   ▼
Cloudinary Upload
   │
   ▼
Cloudinary CDN
```

---

# Project Structure

```text
src/
├── application/
│   ├── services/
│   ├── middleware/
│   └── dtos/
├── infrastructure/
│   ├── grpc/
│   ├── redis/
│   ├── kafka/
│   ├── s3/
│   ├── cloudinary/
│   └── observability/
├── presentation/
│   ├── routes/
│   ├── controllers/
│   └── validators/
├── shared/
└── index.ts
```

---

# gRPC Integration

The gateway communicates with all backend services using **gRPC**.

### Connected Services

| Service              | Purpose           |
| -------------------- | ----------------- |
| Auth Service         | Authentication    |
| User Service         | User profiles     |
| Course Service       | Course management |
| Payment Service      | Payments          |
| Order Service        | Orders            |
| Notification Service | Notifications     |
| Chat Service         | Messaging         |

### Transport Translation

The gateway converts:

* HTTP requests → gRPC requests
* gRPC responses → HTTP responses
* gRPC errors → REST-friendly errors

This allows frontend applications to use familiar REST/HTTP APIs while internal services communicate efficiently through gRPC.

---

# API Design

## REST API

Public APIs are exposed under a versioned namespace.

```text
/api/v1/auth
/api/v1/users
/api/v1/courses
/api/v1/orders
/api/v1/payments
/api/v1/notifications
/api/v1/chat
```

## Example Endpoints

### Authentication

```text
POST   /api/v1/auth/login
POST   /api/v1/auth/register
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
```

### Users

```text
GET    /api/v1/users/profile
PUT    /api/v1/users/profile
POST   /api/v1/users/avatar
```

### Courses

```text
GET    /api/v1/courses
GET    /api/v1/courses/:id
POST   /api/v1/courses
PUT    /api/v1/courses/:id
```

### Orders

```text
POST   /api/v1/orders
GET    /api/v1/orders/:id
GET    /api/v1/orders
```

### Payments

```text
POST   /api/v1/payments/create
POST   /api/v1/payments/verify
POST   /api/v1/payments/refund
```

---

# Dependency on @edulearn/core

The API Gateway relies heavily on **@edulearn/core** for shared platform infrastructure.

## Logging

* Winston structured logging
* JSON log output
* Correlation IDs
* Trace-aware logging
* Request diagnostics

## Metrics

Prometheus metrics include:

* HTTP request count
* HTTP request duration
* Active connections
* gRPC latency
* Authentication failures
* Rate limit rejections
* File upload operations
* S3 presigned URL generation

Exposed at:

```text
/metrics
```

## Distributed Tracing

OpenTelemetry instrumentation provides end-to-end tracing across the entire platform.

Trace flow:

```text
Client
   │
   ▼
API Gateway
   │
   ▼
gRPC Client
   │
   ▼
Microservice
   │
   ▼
Database / Redis / Kafka
```

Traces are exported to **OTEL Collector → Tempo → Grafana**.

## Shared Infrastructure

Provided by **@edulearn/core**:

* Logger
* Metrics registry
* Tracer
* Redis client
* Kafka producer/consumer
* Health checks
* Configuration utilities
* Common error handling

---

# Security

The gateway enforces platform-wide security policies.

## Authentication

* JWT validation
* Token expiration checks
* Identity propagation
* Secure token handling

## Authorization

* Role-based access control
* Route protection
* Resource ownership validation
* Admin-only endpoints

## HTTP Security

* Helmet security headers
* CORS configuration
* Input validation
* Request sanitization
* Secure cookies
* Content Security Policy

## Rate Limiting

Redis-backed distributed rate limiting protects against:

* Brute-force attacks
* Credential stuffing
* API abuse
* Resource exhaustion

## Secrets Management

Production deployments retrieve secrets from:

* AWS Secrets Manager
* External Secrets Operator

---

# Observability

The gateway is the primary observability entry point for external traffic.

## Logging

* Structured JSON logs
* Request/response logging
* Correlation IDs
* User identity logging
* Error diagnostics

Pipeline:

```text
API Gateway
     │
     ▼
Winston
     │
     ▼
OTEL Collector
     │
     ▼
Loki
     │
     ▼
Grafana
```

## Metrics

Prometheus metrics include:

* Request throughput
* Response latency
* Error rate
* Authentication success/failure
* Rate limit violations
* Active connections
* gRPC request latency

Pipeline:

```text
API Gateway
     │
     ▼
Prometheus
     │
     ▼
Grafana
```

## Distributed Tracing

Every incoming request receives a trace context that propagates through all downstream services.

Pipeline:

```text
API Gateway
     │
     ▼
OTEL Collector
     │
     ▼
Tempo
     │
     ▼
Grafana
```

---

# Local Development

## Prerequisites

* Node.js 22+
* Yarn
* Redis
* Kafka
* Backend microservices

## Install

```bash
yarn install
```

## Start Development

```bash
yarn dev
```

## Build

```bash
yarn build
```

## Start Production

```bash
yarn start
```

---

# Environment Variables

| Variable                    | Description             |
| --------------------------- | ----------------------- |
| PORT                        | HTTP server port        |
| REDIS_URL                   | Redis connection string |
| ACCESS_TOKEN_SECRET         | JWT access secret       |
| REFRESH_TOKEN_SECRET        | JWT refresh secret      |
| ALLOWED_ORIGINS             | CORS origins            |
| AWS_REGION                  | AWS region              |
| S3_BUCKET                   | S3 bucket name          |
| CLOUDINARY_CLOUD_NAME       | Cloudinary cloud        |
| CLOUDINARY_API_KEY          | Cloudinary API key      |
| CLOUDINARY_API_SECRET       | Cloudinary API secret   |
| OTEL_EXPORTER_OTLP_ENDPOINT | OTLP collector endpoint |
| LOG_LEVEL                   | Logging level           |

See `env.example` for the complete configuration.

---

# Docker

The gateway uses a **multi-stage Docker build** optimized for production.

Optimizations include:

* Multi-stage compilation
* Dependency pruning
* Layer caching
* Minimal runtime image
* Non-root execution
* Reduced attack surface

---

# Kubernetes Deployment

Deployment is managed through the **Edulearn umbrella Helm chart**.

The gateway is deployed with:

* ClusterIP service
* Gateway API integration
* HTTPRoute configuration
* Liveness probes
* Readiness probes
* Resource requests and limits
* Horizontal Pod Autoscaler support
* Prometheus ServiceMonitor

External traffic enters the platform through:

* AWS Gateway API
* AWS Load Balancer Controller
* HTTPRoute
* Route53 DNS

---

# CI/CD

This service participates in the platform GitOps deployment pipeline.

```text
Git Push
    │
    ▼
GitHub Actions
    ├── Test
    ├── Build
    ├── Lint
    ├── Trivy Scan
    └── Push to GHCR
             │
             ▼
ArgoCD Image Updater
             │
             ▼
ArgoCD
             │
             ▼
Amazon EKS
```

---

# Performance Optimizations

Implemented optimizations include:

* gRPC binary transport
* Redis caching
* Connection pooling
* HTTP compression
* Efficient middleware pipeline
* Presigned S3 uploads
* Reduced payload forwarding
* Optimized Docker image size

---

# Testing

```bash
# Unit tests
yarn test

# Integration tests
yarn test:integration

# End-to-end tests
yarn test:e2e

# Coverage
yarn test:cov
```

---

# Related Repositories

| Repository                    | Description                                                   |
| ----------------------------- | ------------------------------------------------------------- |
| [edulearn-platform](https://github.com/muhammed-shafeeque-th/edulearn-platform)             | Platform orchestration repository                             |
| [edulearn-client](https://github.com/muhammed-shafeeque-th/edulearn-client)          | Edulearn frontend                                                   |
| [edulearn-user-service](https://github.com/muhammed-shafeeque-th/edulearn-user-srv)         | User profile service                                          |
| [edulearn-course-service](https://github.com/muhammed-shafeeque-th/edulearn-course-srv)       | Course management service                                     |
| [edulearn-payment-service](https://github.com/muhammed-shafeeque-th/edulearn-payment-srv)      | Payment processing service                                    |
| [edulearn-auth-service](https://github.com/muhammed-shafeeque-th/edulearn-auth-srv)      | Authentication service                                    |
| [edulearn-order-service](https://github.com/muhammed-shafeeque-th/edulearn-order-srv)        | Order management service                                      |
| [edulearn-notification-service](https://github.com/muhammed-shafeeque-th/edulearn-notification-srv) | Notification service                                          |
| [edulearn-auth-service](https://github.com/muhammed-shafeeque-th/edulearn-auth-srv)         | Authentication service                                        |
| [@edulearn/core](https://github.com/muhammed-shafeeque-th/edulearn-core)                | Shared logging, metrics, tracing, Redis, Kafka, health checks |
| [@edulearn/nest](https://github.com/muhammed-shafeeque-th/edulearn-nest)                | Shared NestJS infrastructure package                          |

---

# License

This project is part of the **Edulearn Platform** and is licensed under the MIT [License](./LICENSE).
