# API Endpoints
This folder contains API endpoints as well what each api does

### Account
- `POST /api/account/register` - Register a new user
- `POST /api/account/login` - Login user
- `POST /api/account/verify` - Verify users who logged in with a verification code
- `PUT /api/account/verify` - Resend verification code

### Contracts
- `/api/review` - Review document with AI through Openrouter
- `GET /api/list/` - Gets a list of contracts based on filters
- `` - Send a notification about a contract's validity period

### Drafting
- `` - Save a contract and its details based on its type and status