# Hazard database ERD

This diagram represents the MongoDB document shapes created and queried by the current backend. It does not imply a relational foreign key: reports do not store a user identifier, so there is no user-to-report reference in the current schema.

```mermaid
erDiagram
  USERS {
    ObjectId _id PK
    string username "required; unique index"
    string email "required; unique index"
    string passwordSalt "required for registered accounts"
    string passwordHash "required for registered accounts"
    Date createdAt "account creation time"
  }
  HAZARD_REPORTS {
    ObjectId _id PK
    number latitude "required; -90..90"
    number longitude "required; -180..180"
    string description "optional; defaults to empty string"
    string topic "optional; defaults to empty string"
    string severity "optional; defaults to High"
    Date createdAt "created by server"
    string resolved "optional; defaults to No; Yes or No in API updates"
    object locationDetails "optional: city, town, postcode"
  }
```

## Collections

- **`users`** — created during registration. Stores `username`, normalized `email`, `passwordSalt`, `passwordHash`, and `createdAt`. The database initialization creates unique indexes on `username` and `email`. Raw passwords are not stored.
- **`hazard_reports`** — created from validated numeric coordinates. Stores `latitude`, `longitude`, `description`, `topic`, `severity`, `createdAt`, and `resolved`; optional `locationDetails` may contain `city`, `town`, and `postcode`. Updates are limited to topic, description, severity, location details, and resolution status.

MongoDB adds an `_id` ObjectId to documents. No explicit user/report relationship, owner field, or foreign key is present.
