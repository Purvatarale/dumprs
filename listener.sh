
endpoint=http://localhost:4000/chatapp/api/v1/webhook/listener
endpoint=http://10.99.1.194/chatapp/api/v1/webhook/listener

endpoint=http://10.99.1.194/chatapp
endpoint=https://portal.iitb.ac.in/chatapp
endpoint=http://10.99.1.194/chatapp/api/v1/categories/
endpoint=http://localhost:4000/chatapp/api/v1/categories/
endpoint=http://localhost:4000/chatapp
endpoint=http://localhost:4000/




echo POST
curl -X POST $endpoint -H "Content-Type: application/json"   -d '{
    "event": "message_created",
    "message_type": "outgoing",
    "conversation": {
      "id": "12345",
      "inbox_id": "SjTgz4zkUrqS5gudVaHcgtoU",
      "contact_inbox": { "source_id": "contact_123" },
      "status": "open",
      "can_reply": true
    },                                  
    "content": "Curl message 1",
    "id": "msg_12345",
    "sender": { "name": "Agent", "email": "agent@example.com" },
    "created_at": "2025-01-31T10:00:00Z"
  }'


echo GET $endpoint
curl -X GET $endpoint

