# Trash Bin Tracker App

A community-driven application that helps users locate and report trash bins in urban areas.

## Overview

This application allows users to discover and contribute to a shared database of trash bin locations. It features a user-friendly map interface and an admin approval system to ensure data quality.

## Key Features

- **User Contributions**: Users can add new trash bin locations by placing pins on an interactive map
- **Admin Dashboard**: Admin users can review, approve, or reject user submissions
- **Secure Authentication**: Cookie-based session management for user login and access control
- **File Upload Support**: Image uploads for trash bin documentation using Multer and Cloudinary

## Problem Statement

Finding available trash bins in unfamiliar areas can be challenging. This application solves that problem by creating a crowdsourced map of trash bin locations, making it easier for users to dispose of waste responsibly.

## Use Cases

- Works particularly well in areas with scattered or poorly marked trash receptacles
- Ideal for cities like Tokyo or similar urban environments with less widespread trash bin availability
- Supports tourism and visitor navigation in unfamiliar cities

## Technology Stack

**Frontend:**

- React.js
- Bootstrap CSS framework

**Backend:**

- Node.js
- Multer (file upload middleware)
- Cloudinary (cloud storage)
- Express (web framework)
- Cookie Session (authentication)

## Architecture

```
Frontend (React/Bootstrap)
    ↓
Backend (Node.js API)
    ↓
Cloud Storage (Cloudinary)
```
