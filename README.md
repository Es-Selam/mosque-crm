# Mosque CRM

An open-source Customer Relationship Management system specifically designed for mosques and Islamic centers.

## 🌟 Project Overview

Mosque CRM is a volunteer-driven open-source project aimed at providing Islamic centers with a comprehensive platform to manage members, events, payments, and family relationships. The system supports multi-tenancy, enabling both cloud-hosted and on-premises deployments.

## 🚀 Key Features

- **Member Management**: Track member details, family relationships, and contact information
- **Family Structure**: Manage household relationships for services like funeral arrangements (Bestattungsdienst) and children's education
- **Payment Processing**: Track member contributions, generate invoices, and process payments
- **Event Management**: Schedule and manage community events with attendance tracking
- **Self-Service Portal**: Members can update their information and view payment history
- **Multi-Tenancy**: Each mosque operates in its own isolated environment
- **Real-Time Updates**: Changes made by administrators appear instantly for all active users
- **Authentication Options**:
  - Magic email links (primary method for members)
  - Optional password authentication
  - Two-factor authentication (2FA)
  - Self-service password reset

## 💻 Technology Stack

### Backend
- **Framework**: Node.js with NestJS (TypeScript)
- **Database**: PostgreSQL with schema-based multi-tenancy
- **Real-time Communication**: Socket.io for WebSockets
- **Authentication**: JWT with custom implementation

### Frontend
- **Framework**: React with TypeScript
- **State Management**: React Context API / Redux
- **UI Components**: Material-UI or Tailwind CSS

### DevOps & Infrastructure
- **Containerization**: Docker + Docker Compose
- **Orchestration**: Kubernetes support for scaling
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana

### Payment Integration
- **Payment Processors**:
  - Stripe for international payments
  - Twint for Swiss users
  - QR-bill generation for Swiss bank transfers

## 🏗️ Architecture

### Multi-Tenancy Implementation

The system utilizes a schema-based multi-tenancy approach with PostgreSQL:

```
database: mosque_crm
├── schema: public (system tables, tenant registry)
├── schema: mosque_1 (all tables for Mosque 1)
├── schema: mosque_2 (all tables for Mosque 2)
└── ...
```

Key architectural components:
- **Tenant Middleware**: Identifies the current tenant from the request
- **Context Isolation**: Sets PostgreSQL search_path to ensure query isolation
- **Tenant Provisioning**: Automated setup of new mosque environments
- **Migration Management**: Handles schema updates across all tenants

### Role-Based Access Control

The system implements a flexible permission system with predefined roles:
- **System Administrator**: Manages all mosques/tenants
- **Mosque Administrator**: Full access to a specific mosque
- **Staff**: Limited administrative access
- **Member**: Self-service access to own records
- **Guest**: Public information only

## 🚢 Deployment Options

### Cloud Hosting
- Multi-tenant SaaS deployment with Kubernetes
- Automatic scaling based on tenant activity
- Centralized management and updates

### On-Premises
- Self-hosted with Docker Compose
- Simplified setup for single-mosque deployment
- Full data sovereignty and privacy control

## 🔧 Development Setup

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- PostgreSQL 14+

### Local Development
```bash
# Clone the repository
git clone https://github.com/your-username/mosque-crm.git
cd mosque-crm

# Install dependencies
npm install

# Start development environment
docker-compose up -d

# Set up database
npm run migration:run

# Start API server
npm run start:dev

# Start frontend
cd frontend && npm start
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on the process for submitting pull requests.

## 📄 License

This project is licensed under the GNU Affero General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

For questions or support, please open an issue on GitHub or contact the maintainers directly.

---

*Built with ❤️ by volunteers dedicated to serving the Muslim community.*
