# LINE Admin Conversation API Documentation

## Database Setup

### 1. Create Tables in Supabase SQL Editor

Run these commands separately:

```sql
-- 1. Create line_admin_conversations table
CREATE TABLE line_admin_conversations (
  id BIGSERIAL PRIMARY KEY,
  line_user_id TEXT NOT NULL,
  line_username TEXT,
  message_role TEXT NOT NULL CHECK (message_role IN ('user', 'assistant', 'admin')),
  message_content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  admin_id UUID,
  admin_name TEXT,
  conversation_session_id TEXT,
  metadata JSONB DEFAULT '{}',
  platform TEXT DEFAULT 'line',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create customers table
CREATE TABLE customers (
  id BIGSERIAL PRIMARY KEY,
  line_user_id TEXT UNIQUE,
  line_username TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  email TEXT,
  conversation_summary TEXT,
  admin_performance_summary JSONB DEFAULT '{}',
  last_conversation_date TIMESTAMP WITH TIME ZONE,
  total_conversations INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes
CREATE INDEX idx_line_admin_conversations_user_id ON line_admin_conversations(line_user_id);
CREATE INDEX idx_line_admin_conversations_created_at ON line_admin_conversations(created_at);
CREATE INDEX idx_customers_line_user_id ON customers(line_user_id);
CREATE INDEX idx_customers_phone ON customers(customer_phone);

-- 4. Enable RLS (optional)
ALTER TABLE line_admin_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
```

## API Endpoints

### 1. LINE Webhook (Receives LINE messages)

```
POST /api/v1/line/admin-coversation
```

- Receives LINE webhook events
- Saves conversations to database
- Sends auto-responses

### 2. Get Conversations

```
GET /api/v1/line/admin-coversation?action=conversations&userId=U1234&date=2025-01-18
```

### 3. Get Daily Summary

```
GET /api/v1/line/admin-coversation?action=daily_summary&date=2025-01-18
```

### 4. Get Admin Performance

```
GET /api/v1/line/admin-coversation?action=admin_performance&date=2025-01-18
```

## Cron Jobs

### 1. Manual Daily Analysis with 2-day cleanup

```
POST /api/v1/line/admin-coversation/cron?action=daily_analysis&cleanup_days=2
```

### 2. Emergency Cleanup (7 days)

```
POST /api/v1/line/admin-coversation/cron?action=cleanup_only&cleanup_days=7
```

### 3. Daily Cleanup (1 day) - Automatic

```
POST /api/v1/line/admin-coversation/cron?action=daily_analysis&cleanup_days=1
```

## Vercel Cron Configuration

Add to your `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/v1/line/admin-coversation/cron?action=daily_analysis&cleanup_days=1",
      "schedule": "0 23 * * *"
    }
  ]
}
```

## Environment Variables Required

```env
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
LINE_CHANNEL_SECRET=your_line_channel_secret
```

## LINE Webhook URL Setup

Set your LINE webhook URL to:

```
https://yourdomain.com/api/v1/line/admin-coversation
```

## Data Flow

1. **Customer sends LINE message** → Webhook receives → Save to `line_admin_conversations`
2. **Admin responds** → Save admin response → Send to LINE user
3. **Daily at 23:00** → Cron job analyzes conversations → Extract customer data → Save to `customers` table → Delete old conversations
4. **Admin performance** → Stored in `customers.admin_performance_summary` JSONB field

## Example Admin Performance Summary Structure

```json
{
  "2025-01-18": {
    "total_messages": 5,
    "admins_count": 2,
    "response_quality": 4.2,
    "last_interaction": "2025-01-18"
  },
  "2025-01-19": {
    "total_messages": 3,
    "admins_count": 1,
    "response_quality": 4.5,
    "last_interaction": "2025-01-19"
  },
  "overall_stats": {
    "total_interactions": 8,
    "avg_response_quality": 4.35,
    "last_updated": "2025-01-19T23:00:00Z"
  }
}
```

## Testing

### 1. Test Webhook

```bash
curl -X POST https://yourdomain.com/api/v1/line/admin-coversation \
  -H "Content-Type: application/json" \
  -d '{"events": []}'
```

### 2. Test Cron Job

```bash
curl -X POST https://yourdomain.com/api/v1/line/admin-coversation/cron?action=daily_analysis&cleanup_days=1
```

### 3. Get Customer Data

```bash
curl https://yourdomain.com/api/v1/line/admin-coversation?action=admin_performance&date=2025-01-18
```
