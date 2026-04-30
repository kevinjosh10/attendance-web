# Attendance Web Application Architecture

This document describes the high-level architecture and file structure of the Jerusalem Attendance web application.

## Overview

The application is a lightweight, frontend-only Single Page Application (SPA) built using Vanilla JavaScript and bundled with Vite. It interacts with native browser APIs (Geolocation, Local Storage) and communicates with a serverless AWS backend.

## Architecture Diagram

```mermaid
graph TD
    User([Student]) -->|Interacts with| UI[index.html & style.css]
    
    subgraph Frontend [Frontend Application (Vanilla JS)]
        UI
        MainCtrl[src/main.js<br/>App Controller]
        
        subgraph Services [Services Layer]
            ApiSvc[src/services/api.js]
            GeoSvc[src/services/geolocation.js]
        end
        
        subgraph Utils [Utility Layer]
            StorageUtil[src/utils/storage.js]
            DomUtil[src/utils/dom.js]
        end
        
        Config[src/config/env.js<br/>Environment Constants]
        
        UI <-->|DOM Events / Updates| MainCtrl
        MainCtrl -->|Submits Data| ApiSvc
        MainCtrl -->|Requests Location| GeoSvc
        MainCtrl -->|Manages State| StorageUtil
        MainCtrl -->|Safe DOM Ops| DomUtil
        
        MainCtrl --> Config
        ApiSvc -.-> Config
        GeoSvc -.-> Config
    end
    
    subgraph Browser [Browser APIs]
        GeoAPI[Navigator Geolocation API]
        LocalStorage[Local Storage API]
    end
    
    subgraph Backend [AWS Serverless Backend]
        APIGW[AWS API Gateway]
        Lambda[AWS Lambda Function]
        DB[(Backend Storage)]
    end
    
    GeoSvc -->|Fetch coordinates| GeoAPI
    StorageUtil -->|Persist device ID & student info| LocalStorage
    ApiSvc -->|POST /attendance| APIGW
    APIGW --> Lambda
    Lambda --> DB
```

## Directory Structure & Module Responsibilities

- **`index.html`**: The main entry point containing the structural layout of the application (Student Details Form, Attendance Section).
- **`src/styles/style.css`**: The stylesheet managing the application's responsive, modern UI design.
- **`src/main.js`**: The central application controller. It wires up DOM events, manages local UI state (loading, cooldowns), and coordinates between services and utilities.
- **`src/config/env.js`**: Houses global configuration constants such as the AWS API Gateway URL, app version, and geolocation timeouts.
- **`src/services/api.js`**: Responsible for network communication. It formats the attendance payload and sends it to the AWS backend via `fetch`.
- **`src/services/geolocation.js`**: Wraps the browser's native Geolocation API in Promises and handles error mapping (e.g., permission denied, timeouts) into user-friendly messages.
- **`src/utils/storage.js`**: Manages secure interactions with `localStorage`. It handles generating/retrieving the unique `deviceID`, saving student details, and tracking the last attendance time for cooldown logic.
- **`src/utils/dom.js`**: Provides utility functions for safe DOM manipulation (preventing XSS by using `textContent` and Text nodes) and data formatting (e.g., department codes, academic year).
- **`package.json`**: Defines the project metadata and Vite build scripts (`dev`, `build`, `preview`).
