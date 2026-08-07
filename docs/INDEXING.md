# Database Indexing & Constraints

## MongoDB Indexes

### User Info Collection (`userinfos`)

| Index | Type | Constraint | Purpose |
|-------|------|------------|---------|
| `userId` | ascending | unique | Primary lookup |
| `accountNumber` | ascending | unique | Custom read by accountNumber |
| `emailAddress` | ascending | unique | Unique email lookup |
| `registrationNumber` | ascending | unique | Custom read by registrationNumber |
| `fullName` | text | - | Full-text search by name |

### Account Login Collection (`accountlogins`)

| Index | Type | Constraint | Purpose |
|-------|------|------------|---------|
| `accountId` | ascending | unique | Primary lookup |
| `userName` | ascending | unique | Login lookup |
| `userId` | ascending | - | Relationship lookup |
| `lastLoginDateTime` | descending | - | Find inactive accounts |

## Index Definitions (Mongoose)

Indexes are defined via `@Prop({ unique: true })` decorators and additional `schema.index()` calls.

## Manual Index Scripts

If you need to create indexes manually, run these in MongoDB shell:

```javascript
use('db_damar_backend_betest');

db.userinfos.createIndex({ userId: 1 }, { unique: true });
db.userinfos.createIndex({ accountNumber: 1 }, { unique: true });
db.userinfos.createIndex({ emailAddress: 1 }, { unique: true });
db.userinfos.createIndex({ registrationNumber: 1 }, { unique: true });
db.userinfos.createIndex({ fullName: 'text' });

db.accountlogins.createIndex({ accountId: 1 }, { unique: true });
db.accountlogins.createIndex({ userName: 1 }, { unique: true });
db.accountlogins.createIndex({ userId: 1 });
db.accountlogins.createIndex({ lastLoginDateTime: -1 });
```
