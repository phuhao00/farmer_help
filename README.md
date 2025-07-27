# 🌱 Farmer Help - Farm-to-Table E-commerce Platform

A comprehensive full-stack e-commerce platform connecting farmers directly with consumers, enabling fresh produce sales with integrated payment processing, order tracking, and user management.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure registration and login for farmers and customers
- **Product Management**: Farmers can list and manage their produce
- **Shopping Cart**: Intuitive cart system with real-time updates
- **Payment Processing**: Integrated payment gateway for secure transactions
- **Order Tracking**: Real-time order status updates and tracking
- **Responsive Design**: Mobile-first approach with adaptive layouts

### User Roles
- **Customers**: Browse products, place orders, track deliveries
- **Farmers**: Manage inventory, process orders, track sales
- **Admin**: Platform management and oversight

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern UI library
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - High-quality UI components
- **React Router** - Client-side routing
- **Context API** - State management
- **Axios** - HTTP client

### Backend
- **Go** - High-performance backend language
- **Gorilla Mux** - HTTP router and URL matcher
- **JWT** - Authentication tokens
- **PostgreSQL** - Primary database
- **RESTful API** - Clean API architecture

### Development Tools
- **Webpack** - Module bundler
- **Jest** - Testing framework
- **ESLint** - Code linting
- **Git** - Version control

## 📁 Project Structure

```
farmer_help/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   ├── utils/         # Utility functions
│   │   └── __tests__/     # Test files
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
├── server-go/             # Go backend
│   ├── routes/            # API routes
│   ├── models/            # Data models
│   ├── middleware/        # HTTP middleware
│   └── main.go           # Server entry point
├── .gitignore            # Git ignore rules
└── README.md             # Project documentation
```

## 🚦 Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **Go** (v1.19 or higher)
- **PostgreSQL** (v12 or higher)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/phuhao00/farmer_help.git
   cd farmer_help
   ```

2. **Setup Frontend**
   ```bash
   cd client
   npm install
   ```

3. **Setup Backend**
   ```bash
   cd ../server-go
   go mod download
   ```

4. **Environment Configuration**
   
   Create `.env` files based on the examples:
   ```bash
   # Frontend
   cp client/.env.example client/.env
   
   # Backend
   cp server-go/.env.example server-go/.env
   ```
   
   Update the environment variables with your configuration.

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd server-go
   go run main.go
   ```
   Server will run on `http://localhost:8080`

2. **Start the Frontend Development Server**
   ```bash
   cd client
   npm start
   ```
   Application will open at `http://localhost:3000`

## 🧪 Testing

### Frontend Tests
```bash
cd client
npm test
```

### Backend Tests
```bash
cd server-go
go test ./...
```

## 📱 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Product Endpoints
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product (farmers only)
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Order Endpoints
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get specific order
- `PUT /api/orders/:id/status` - Update order status

### Payment Endpoints
- `POST /api/payments/process` - Process payment
- `GET /api/payments/:id` - Get payment details

## 🔧 Configuration

### Frontend Configuration
- **API Endpoint**: Configure in `client/.env`
- **Payment Gateway**: Set up payment provider credentials
- **Theme**: Customize in `client/tailwind.config.js`

### Backend Configuration
- **Database**: PostgreSQL connection string
- **JWT Secret**: Secure token signing key
- **CORS**: Configure allowed origins
- **Port**: Server port configuration

## 🚀 Deployment

### Frontend Deployment
```bash
cd client
npm run build
```

### Backend Deployment
```bash
cd server-go
go build -o farmer-help-server
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Development Team** - Initial work and ongoing development

## 🙏 Acknowledgments

- React community for excellent documentation
- Go community for robust backend tools
- Tailwind CSS for beautiful styling utilities
- All contributors who help improve this platform

## 📞 Support

For support, email support@farmerhelp.com or create an issue in this repository.

---

**Happy Farming! 🌾**