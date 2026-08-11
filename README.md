# JobGraph

JobGraph is a full stack job application platform built with React, Spring Boot, and CognoDB. It helps users search and filter jobs, apply for jobs, prevent duplicate applications, view application history, and manage application status through an admin dashboard.

## Technology Stack

- React
- Vite
- Spring Boot
- Java
- CognoDB
- openCypher
- Neo4j Java Driver

## Features

- Job search and filtering
- Job recommendations
- Job application submission
- Duplicate application prevention
- Application history
- Admin dashboard
- Application status management
- Graph database integration

## Why a Graph Database?

JobGraph uses CognoDB to represent relationships between candidates, jobs, skills, and applications.

A graph model makes relationship based queries easier, such as finding jobs related to candidate skills and traversing multiple relationships between candidates, applications, jobs, and skills.

## Data Model

Candidate
  |
  | APPLIED_FOR
  v
Application
  |
  | FOR_JOB
  v
Job
  |
  | REQUIRES
  v
Skill

Candidate
  |
  | HAS_SKILL
  v
Skill

## Project Structure

- React frontend
- Spring Boot backend
- CognoDB graph database
- Cypher queries
- Seed data loader

## Database

The application uses CognoDB through the official Neo4j Java driver.

Database credentials are loaded through environment variables.

Required environment variables:

COGNODB_URI=your_cognodb_uri
COGNODB_USERNAME=your_username
COGNODB_PASSWORD=your_password

Do not commit real database credentials to GitHub.

## Running the Backend

Open the backend project in Eclipse or another Java IDE.

Configure the required environment variables.

Run:

JobgraphApplication.java

## Running the Frontend

Open the frontend project in a terminal.

Install dependencies:

npm install

Start the development server:

npm run dev

Open the URL shown by Vite.

## Graph Queries

The application uses parameterized Cypher queries through the Neo4j driver.

The queries support job search, applications, duplicate application prevention, application history, and admin status management.

## Seed Data

SeedDataLoader.java loads initial job and related graph data into CognoDB.

## Admin Dashboard

The admin dashboard displays:

- Total jobs
- Total applications
- Applied applications
- Shortlisted applications
- Rejected applications
- Selected applications

Administrators can update application status from the dashboard.

## Project Screenshots

Screenshots of the application interface and admin dashboard are included in the repository.

## Author

Rakesh Manchikanti
