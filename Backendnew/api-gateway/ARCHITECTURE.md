# API Gateway Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT                                   │
│                    (Web/Mobile App)                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP Requests
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NGINX API GATEWAY                             │
│                      (Port 80)                                   │
│                                                                  │
│  Features:                                                       │
│  • Reverse Proxy                                                │
│  • Load Balancing                                               │
│  • Rate Limiting (10 req/s per IP)                              │
│  • CORS Handling                                                │
│  • Request Routing                                              │
│  • Timeouts & Error Handling                                    │
└──────────┬─────────────┬─────────────┬─────────────────────────┘
           │             │             │
           │             │             │
┌──────────▼──────┐ ┌────▼─────┐ ┌────▼──────────────────────┐
│  Rule-based     │ │ ML-based │ │ Sentiment Analysis        │
│  Fraud Detection│ │  Fraud   │ │ Service                   │
│  Service        │ │ Detection│ │                           │
│  (Port 8001)    │ │ Service  │ │ (Port 8003)               │
│                 │ │(Port 8002│ │                           │
│  Endpoints:     │ │)         │ │ Endpoints:                │
│  • /detect      │ │          │ │ • /sentiment              │
│  • /detect-     │ │ Endpoints│ │                           │
│    coordinated  │ │ • /      │ │ Technology:               │
│                 │ │  detection│ │ • FastAPI                │
│ Technology:     │ │          │ │ • Transformers (HF)       │
│ • FastAPI       │ │Technology│ │ • RoBERTa Model           │
│ • Rule Engine   │ │ • FastAPI│ │                           │
│ • Pattern       │ │ • ML     │ │                           │
│   Matching      │ │  Model   │ │                           │
│                 │ │ • Pickle │ │                           │
└─────────────────┘ └──────────┘ └───────────────────────────┘
```

## Request Flow

### Example: Fraud Detection Request

1. **Client** sends POST request:
   ```
   POST http://localhost/api/rule-fraud/detect
   ```

2. **Nginx Gateway** receives request:
   - Checks rate limit
   - Adds CORS headers
   - Matches location pattern `/api/rule-fraud/`

3. **Nginx** rewrites and forwards:
   ```
   /api/rule-fraud/detect → http://localhost:8001/detect
   ```

4. **Backend Service** processes:
   - Rule-based Fraud Detection service receives at `/detect`
   - Processes the review data
   - Returns fraud analysis

5. **Nginx** forwards response back to client

## URL Routing Map

| Client Request | Nginx Rewrites To | Backend Service |
|----------------|-------------------|-----------------|
| `GET /` | `GET /` | Gateway Info (Nginx) |
| `GET /health` | `GET /health` | Health Check (Nginx) |
| `POST /api/rule-fraud/detect` | `POST /detect` | Rule Service:8001 |
| `POST /api/rule-fraud/detect-coordinated` | `POST /detect-coordinated` | Rule Service:8001 |
| `POST /api/ml-fraud/detection` | `POST /detection` | ML Service:8002 |
| `POST /api/sentiment/sentiment` | `POST /sentiment` | Sentiment Service:8003 |

## Technology Stack

### API Gateway Layer
- **Nginx**: Reverse proxy, load balancer
- **Alpine Linux**: Lightweight container base

### Backend Services
- **FastAPI**: Python web framework
- **Uvicorn**: ASGI server
- **Pydantic**: Data validation

### ML/AI Components
- **scikit-learn**: ML models
- **Transformers**: NLP models
- **PyTorch**: Deep learning backend

### DevOps
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration

## Security Features

1. **Rate Limiting**
   - 10 requests/second per IP
   - Burst capacity: 20 requests
   - Prevents abuse and DoS

2. **CORS Configuration**
   - Configurable origins
   - Handles preflight requests
   - Secure cross-origin access

3. **Timeouts**
   - Connect timeout: 60-120s
   - Read/Write timeouts configured
   - Prevents hanging connections

4. **Header Management**
   - X-Real-IP forwarding
   - X-Forwarded-For tracking
   - Original host preservation

## Scalability Options

### Horizontal Scaling
```yaml
# Add more instances in docker-compose.yml
rule-fraud-service-1:
  # ... config ...
rule-fraud-service-2:
  # ... config ...
```

### Nginx Load Balancing
```nginx
upstream rule_based_fraud_detection {
    server rule-fraud-service-1:8001;
    server rule-fraud-service-2:8001;
    server rule-fraud-service-3:8001;
}
```

## Monitoring Points

1. **Gateway Level**
   - Request count
   - Response times
   - Error rates
   - Rate limit triggers

2. **Service Level**
   - API response times
   - Model inference time
   - Memory usage
   - Error logs

## Deployment Scenarios

### Development
- All services on localhost
- Different ports (8001, 8002, 8003)
- Hot reload enabled

### Production
- Services in containers
- Behind Nginx gateway
- SSL/TLS termination
- Log aggregation
- Health monitoring

### Cloud Deployment
- Each service as separate deployment
- Nginx as ingress controller
- Auto-scaling enabled
- Managed databases
