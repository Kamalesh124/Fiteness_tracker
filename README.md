# Fitness Tracker Microservices Application

A comprehensive fitness tracking application built with microservices architecture, featuring React frontend, Spring Boot backend services, and AI-powered recommendations.

## 🏗️ Architecture Overview

### Backend Services
- **Gateway Service** (Port 8080) - API Gateway with routing and security
- **User Service** (Port 8081) - User management and Keycloak integration
- **Activity Service** (Port 8082) - Activity tracking and MongoDB persistence
- **AI Service** (Port 8083) - Gemini AI integration for fitness recommendations
- **Config Server** (Port 8888) - Centralized configuration management
- **Eureka Server** (Port 8761) - Service discovery and registration

### Frontend
- **React Application** (Port 3000) - Modern UI with Material-UI components

### Infrastructure
- **MongoDB** (Port 27017) - Database for activity storage
- **RabbitMQ** (Port 5672) - Message queue for service communication
- **Keycloak** (Port 8180) - Authentication and authorization server

## 🚀 Prerequisites

Before running this application, ensure you have the following installed:

### Required Software
1. **Java 17 or higher**
   ```bash
   java -version
   ```

2. **Maven 3.6+**
   ```bash
   mvn -version
   ```

3. **Node.js 16+ and npm**
   ```bash
   node -version
   npm -version
   ```

4. **Docker and Docker Compose**
   ```bash
   docker --version
   docker-compose --version
   ```

## 📦 Installation & Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/Kamalesh124/Fiteness_tracker.git
cd Fiteness_tracker
```

### Step 2: Start Infrastructure Services

Create a `docker-compose.yml` file in the root directory:

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    container_name: fitness-mongodb
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - mongodb_data:/data/db

  rabbitmq:
    image: rabbitmq:3-management
    container_name: fitness-rabbitmq
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: password

  keycloak:
    image: quay.io/keycloak/keycloak:latest
    container_name: fitness-keycloak
    ports:
      - "8180:8080"
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
    command: start-dev

volumes:
  mongodb_data:
```

Start the infrastructure:
```bash
docker-compose up -d
```

### Step 3: Configure Keycloak

1. Access Keycloak at `http://localhost:8180`
2. Login with admin/admin
3. Create a new realm called `fitness`
4. Create a client called `fitness-app` with:
   - Client Type: Public
   - Valid Redirect URIs: `http://localhost:3000/*`
   - Web Origins: `http://localhost:3000`

### Step 4: Build and Run Backend Services

#### Start services in this order:

1. **Config Server**
   ```bash
   cd configserver
   mvn clean install
   mvn spring-boot:run
   ```
   Wait for it to start on port 8888

2. **Eureka Server**
   ```bash
   cd eureka
   mvn clean install
   mvn spring-boot:run
   ```
   Wait for it to start on port 8761

3. **User Service**
   ```bash
   cd userservice
   mvn clean install
   mvn spring-boot:run
   ```

4. **Activity Service**
   ```bash
   cd activityservice
   mvn clean install
   mvn spring-boot:run
   ```

5. **AI Service**
   ```bash
   cd aiservice
   mvn clean install
   mvn spring-boot:run
   ```

6. **Gateway Service**
   ```bash
   cd gateway
   mvn clean install
   mvn spring-boot:run
   ```

### Step 5: Configure AI Service

Add your Gemini API key to the AI service configuration:

1. Get a Gemini API key from Google AI Studio
2. Update `aiservice/src/main/resources/application.properties`:
   ```properties
   gemini.api.key=YOUR_GEMINI_API_KEY_HERE
   ```

### Step 6: Start Frontend Application

```bash
cd fitness-app-frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 🔧 Configuration

### Environment Variables

Create `.env` files in each service directory with appropriate configurations:

#### Backend Services
```properties
# Database
SPRING_DATA_MONGODB_URI=mongodb://admin:password@localhost:27017/fitness?authSource=admin

# RabbitMQ
SPRING_RABBITMQ_HOST=localhost
SPRING_RABBITMQ_PORT=5672
SPRING_RABBITMQ_USERNAME=admin
SPRING_RABBITMQ_PASSWORD=password

# Keycloak
KEYCLOAK_SERVER_URL=http://localhost:8180
KEYCLOAK_REALM=fitness
```

#### Frontend
Update `fitness-app-frontend/src/authConfig.js`:
```javascript
export const keycloakConfig = {
  url: 'http://localhost:8180/',
  realm: 'fitness',
  clientId: 'fitness-app'
};
```

## 🏃‍♂️ Running the Application

### Quick Start (All Services)

Create a startup script `start-all.sh`:

```bash
#!/bin/bash

# Start infrastructure
docker-compose up -d

echo "Waiting for infrastructure to start..."
sleep 30

# Start backend services
gnome-terminal --tab --title="Config Server" -- bash -c "cd configserver && mvn spring-boot:run"
sleep 10

gnome-terminal --tab --title="Eureka Server" -- bash -c "cd eureka && mvn spring-boot:run"
sleep 15

gnome-terminal --tab --title="User Service" -- bash -c "cd userservice && mvn spring-boot:run"
gnome-terminal --tab --title="Activity Service" -- bash -c "cd activityservice && mvn spring-boot:run"
gnome-terminal --tab --title="AI Service" -- bash -c "cd aiservice && mvn spring-boot:run"
sleep 10

gnome-terminal --tab --title="Gateway" -- bash -c "cd gateway && mvn spring-boot:run"
sleep 5

# Start frontend
gnome-terminal --tab --title="Frontend" -- bash -c "cd fitness-app-frontend && npm run dev"

echo "All services starting..."
echo "Frontend: http://localhost:3000"
echo "Eureka Dashboard: http://localhost:8761"
echo "RabbitMQ Management: http://localhost:15672"
echo "Keycloak Admin: http://localhost:8180"
```

### Service Health Checks

- **Eureka Dashboard**: `http://localhost:8761`
- **RabbitMQ Management**: `http://localhost:15672` (admin/password)
- **Keycloak Admin**: `http://localhost:8180` (admin/admin)
- **API Gateway**: `http://localhost:8080/actuator/health`

## 📱 Using the Application

1. **Access the Application**: Navigate to `http://localhost:3000`
2. **Register/Login**: Use Keycloak authentication
3. **Track Activities**: Add fitness activities with metrics
4. **View Recommendations**: AI-powered suggestions based on your activities
5. **Dashboard**: Monitor your fitness progress

## 🛠️ Development

### Building for Production

```bash
# Backend services
for service in configserver eureka userservice activityservice aiservice gateway; do
  cd $service
  mvn clean package -DskipTests
  cd ..
done

# Frontend
cd fitness-app-frontend
npm run build
```

### Running Tests

```bash
# Backend tests
mvn test

# Frontend tests
cd fitness-app-frontend
npm test
```

## 🐳 Docker Deployment

Create Dockerfiles for each service and use Docker Compose for full deployment:

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  # Infrastructure services (MongoDB, RabbitMQ, Keycloak)
  # Backend services
  # Frontend service
```

## 🔍 Troubleshooting

### Common Issues

1. **Port Conflicts**: Ensure all required ports are available
2. **Service Discovery**: Wait for Eureka to fully start before starting other services
3. **Database Connection**: Verify MongoDB is running and accessible
4. **Authentication**: Ensure Keycloak realm and client are properly configured
5. **API Keys**: Verify Gemini API key is correctly set

### Logs

Check service logs for debugging:
```bash
# Backend service logs
tail -f logs/application.log

# Frontend logs
npm run dev (check console output)

# Docker logs
docker-compose logs -f [service-name]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review service logs for error details

---

**Happy Fitness Tracking! 🏃‍♀️💪**