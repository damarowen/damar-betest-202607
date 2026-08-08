# Database Indexing & Constraints

## MongoDB Indexes

### User Info Collection (`userinfos`)

| Index | Type | Constraint | Purpose |
|-------|------|------------|---------|
| `_id` | ascending | unique (auto) | Primary key (MongoDB ObjectId) |
| `accountNumber` | ascending | unique | Custom read by accountNumber |
| `emailAddress` | ascending | unique | Unique email lookup |
| `registrationNumber` | ascending | unique | Custom read by registrationNumber |
| `fullName` | text | - | Full-text search by name |

### Account Login Collection (`accountlogins`)

| Index | Type | Constraint | Purpose |
|-------|------|------------|---------|
| `_id` | ascending | unique (auto) | Primary key (MongoDB ObjectId) |
| `userName` | ascending | unique | Login lookup |
| `userInfoId` | ascending | - | Relationship lookup (ObjectId ref to userinfos) |
| `lastLoginDateTime` | descending | - | Find inactive accounts |

## Index Definitions (Mongoose)

Indexes are defined via `@Prop({ unique: true })` decorators and additional `schema.index()` calls.

## Manual Index Scripts

If you need to create indexes manually, run these in MongoDB shell:

```javascript
use('db_damar_backend_betest');

// userinfos - _id is auto-indexed by MongoDB
db.userinfos.createIndex({ accountNumber: 1 }, { unique: true });
db.userinfos.createIndex({ emailAddress: 1 }, { unique: true });
db.userinfos.createIndex({ registrationNumber: 1 }, { unique: true });
db.userinfos.createIndex({ fullName: 'text' });

// accountlogins - _id is auto-indexed by MongoDB
db.accountlogins.createIndex({ userName: 1 }, { unique: true });
db.accountlogins.createIndex({ userInfoId: 1 });
db.accountlogins.createIndex({ lastLoginDateTime: -1 });
```