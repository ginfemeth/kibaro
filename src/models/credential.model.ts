// src/models/credentials.model.ts
export interface CustomCredentials {
    username: string;
    password: string;
    organization?: string; // Example of adding a custom field (e.g., One-Time Password)
  }