# 🚀 Kuzuflex Web Internship Project - Modern Web Application

## 📋 About the Project

This project is a **completely redesigned** modern web application developed to solve the dynamic content management difficulties that **Kuzuflex** company's existing website `www.kuzuflex.com` was experiencing.

### 🎯 **Project Purpose and Needs Analysis**

**Current Situation:**
- Website built with static HTML/CSS
- Developer intervention required for content updates
- Product catalog updates are time-consuming
- Multi-language content management is difficult
- SEO optimization is insufficient
- Mobile compatibility issues

**Solution:**
- **Full-Stack Modern Web Application** developed
- **Admin Panel** for easy content management
- **Multi-Language Support** (TR, EN, DE, FR)
- **Responsive Design** compatible with all devices
- **Performance-Oriented** modern technologies

## 🚀 Features

### 🌟 **Main Features**
- **Multi-Language Support**: Turkish, English, German, and French language support
- **Responsive Design**: Modern UI/UX compatible with all devices
- **Admin Panel**: Comprehensive admin interface for content management
- **Product Catalog**: Dynamic product and product groups management
- **Solutions Page**: Detailed and interactive presentation of company solutions
- **Market Management**: Customized content for different markets
- **Contact Form**: Advanced form system for customer communication
- **File Management**: Upload and management of images, PDFs, and video files

### 🔧 **Technical Features**
- **TypeScript**: Type-safe development
- **Modern React**: Hooks, Context API, Suspense
- **State Management**: Centralized state management with React Context
- **Routing**: SPA experience with React Router
- **Internationalization**: Multi-language support with i18next
- **Basic Form Validation**: Basic form validation system
- **Basic Error Handling**: Basic error management
- **Loading States**: Loading states for user experience

## 🛠️ Technologies and Approaches

### 🎨 **Frontend Technologies**

#### **Core Framework**
- **React 19** - Modern development with the latest React version
- **TypeScript 5.8** - Type-safe JavaScript development
- **Vite 7** - Ultra-fast build tool and development server

#### **Styling and UI**
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Responsive Design** - Mobile-first approach
- **Modern UI/UX** - Material Design principles
- **CSS Grid & Flexbox** - Modern layout systems

#### **State Management & Routing**
- **React Context API** - Centralized state management
- **React Router 7** - Client-side routing
- **Custom Hooks** - Reusable logic

#### **Internationalization**
- **i18next 25** - Multi-language content management

### ⚙️ **Backend Technologies**

#### **Runtime & Framework**
- **Node.js 18+** - JavaScript runtime environment
- **Express.js 5** - Modern web framework
- **TypeScript 5.8** - Backend type safety

#### **Database & ORM**
- **MS SQL Server** - Powerful enterprise database
- **TypeORM 0.3** - Modern Object-Relational Mapping
- **Migrations** - Database schema management
- **Seeding** - Test data creation

#### **Authentication & Security**
- **JWT (JSON Web Tokens)** - Secure authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

#### **File Management**
- **Multer** - File upload middleware
- **File Validation** - Secure file upload

#### **Email & Communication**
- **Nodemailer** - Email sending
- **SMTP Integration** - Email server integration
- **Template System** - HTML email templates

#### **API Documentation**
- **Swagger/OpenAPI** - Automatic API documentation

### 🗄️ **Database Design**

#### **Entity Relationships**
- **Normalized Design** - Design preventing data duplication
- **Foreign Keys** - Referential integrity
- **Hard Delete** - Performance-oriented deletion operations

#### **Translation System**
- **Multi-language Tables** - Multi-language content management
- **Dynamic Content** - Dynamic content updates

## 📁 Project Architecture

### **Monorepo Structure**
```
Kuzuflex_web_staj/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React contexts
│   │   ├── layouts/       # Page layouts
│   │   ├── locales/       # Language files
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Helper functions
│   │   └── types/         # TypeScript type definitions
│   ├── public/            # Static files
│   └── package.json
├── server/                 # Backend Node.js application
│   ├── src/
│   │   ├── controllers/   # API controllers
│   │   ├── entity/        # Database entities
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic services
│   │   ├── middleware/    # Express middlewares
│   │   ├── utils/         # Helper functions
│   │   └── types/         # TypeScript type definitions
│   ├── migrations/        # Database migrations
│   ├── seeds/             # Test data
│   └── package.json
```

### **Architectural Principles**
- **Separation of Concerns** - Separation of responsibilities
- **Single Responsibility** - Single responsibility principle
- **Dependency Injection** - Dependency injection
- **Repository Pattern** - Data access layer
- **Service Layer** - Business logic layer

## 🗄️ Database Relationship Schema

![Database Relationship Schema](docs/database-schema.png)

*ERD (Entity Relationship Diagram) showing database tables and their relationships*

### **Main Tables and Usage Purposes**

#### **🔐 User Management**
- **Admin** - Admin panel login and permission management
- **PasswordResetToken** - Secure token management for password reset operations

#### **📦 Product Management**
- **Product** - Store company products, create product catalog
- **ProductGroup** - Categorize products, create product groups pages
- **Catalog** - Store and manage product catalogs (PDF)

#### **🛠️ Solution Management**
- **Solution** - Store company solutions, create solution pages
- **SolutionExtraContent** - Add extra content to solution pages

#### **🌍 Market and Content Management**
- **Market** - Content management for different markets, market-specific pages
- **MarketContent** - Add header/footer content to market pages
- **AboutPage** - About us page content and dynamic management
- **AboutPageExtraContent** - Add extra content to about us page

#### **📚 Quality and Document Management**
- **QMDocumentsAndCertificates** - ISO certificates and documents, policies and contracts
- **EmailSettings** - SMTP settings and templates for email sending

#### **🌐 Multi-Language Content System**
- **ProductTranslation** - Multi-language descriptions of products
- **ProductGroupTranslation** - Multi-language descriptions of product groups
- **SolutionTranslation** - Multi-language descriptions of solutions
- **MarketTranslation** - Multi-language descriptions of markets
- **CatalogTranslation** - Multi-language descriptions of catalogs
- **QMDocumentsAndCertificatesTranslation** - Multi-language descriptions of certificates
- **AboutPageTranslation** - Multi-language descriptions of about us page

## 🚀 Installation and Deployment

### **Requirements**
- **Node.js** (v18 or higher)
- **SQL Server** (2019 or higher)
- **Git** (version control)
- **npm** (package manager)

## 📚 API Documentation

### **Swagger UI**
API documentation access:
- **Development**: `http://localhost:3000/api-docs`

### **🔗 API Endpoints**

#### **Product Management**
![Product API Endpoints](docs/api/product-endpoints.png)

#### **Solutions Management**
![Solutions API Endpoints](docs/api/solutions-endpoints.png)

#### **Market Management**
![Market API Endpoints](docs/api/markets-endpoints.png)

#### **Admin Operations**
![Admin API Endpoints](docs/api/admin-endpoints.png)

### **API Features**
- **RESTful Design** - REST principles compliant
- **HTTP Status Codes** - Correct HTTP status codes
- **Error Handling** - Standard error format
- **Validation** - Input data validation

## 🌐 Multi-Language Support

### **Supported Languages**
- 🇹🇷 **Turkish (tr)** - Main language
- 🇬🇧 **English (en)** - International language
- 🇩🇪 **German (de)** - European market
- 🇫🇷 **French (fr)** - European market

### **Translation System**
- **Dynamic Content** - Dynamic content translation

## 🖥️ Application Interface

### **Home Page**
![Home Page](docs/screenshots/home-page.png)

### **Product Catalog**
![Product Catalog](docs/screenshots/product-catalog.png)

### **Solutions Page**
![Solutions Page](docs/screenshots/solutions-page.png)

### **Admin Panel**
![Admin Panel](docs/screenshots/admin-panel.png)

### **Product Management**
![Product Management](docs/screenshots/product-management.png)

### **Solution Management**
![Solution Management](docs/screenshots/solution-management.png)

### **Market Management**
![Market Management](docs/screenshots/market-management.png)

### **Responsive Design**
![Mobile View](docs/screenshots/mobile-view.png)

## 👨‍💼 Admin Panel

### **Access**
- **URL**: `/admin`
- **Role-based Access** - Role-based access control

## 📝 Feature Details

### **Product Management**
- **CRUD Operations** - Create, read, update, delete
- **Product Categories** - Product categories
- **Multi-language Descriptions** - Multi-language descriptions
- **Basic Image Management** - Basic image upload and management

### **Solutions Management**
- **Dynamic Pages** - Dynamic page creation
- **Extra Content** - Add extra content
- **Solution Categories** - Solution categories

### **Market Management**
- **Market-specific Content** - Market-specific content
- **Localized Pages** - Localized pages
- **Market Images** - Market images
- **Regional Settings** - Regional settings

### **Content Management**
- **About Us Page** - About us page
- **Contact Information** - Contact information
- **Quality Documents** - Quality management documents
- **Catalog Management** - Catalog management
- **News & Updates** - News and updates

## 🔧 Development and Deployment

### **Code Standards**
- **ESLint** - Code quality control
- **TypeScript Strict Mode** - Strict type checking
- **Future: Prettier** - Code formatting to be added in the future
- **Future: Git Hooks** - Pre-commit controls to be added in the future

### **Testing Strategy**
- **Future: Unit Tests** - Unit tests to be added in the future
- **Future: Integration Tests** - Integration tests to be added in the future
- **Future: E2E Tests** - End-to-end tests to be added in the future
- **Future: Performance Tests** - Performance tests to be added in the future

### **CI/CD Pipeline**
- **Future: GitHub Actions** - Automated build and test to be added in the future
- **Future: Docker** - Containerization to be added in the future
- **Future: Automated Deployment** - Automated deployment to be added in the future
- **Future: Environment Management** - Environment management to be added in the future

### **Performance Optimization**
- **Future: Code Splitting** - Code splitting to be added in the future
- **Future: Lazy Loading** - Lazy loading to be added in the future
- **Future: Image Optimization** - Image optimization to be added in the future
- **Future: Caching Strategy** - Caching strategy to be added in the future

## 📄 License and Legal

### **Copyright**
- Belongs to **Kuzuflex** company
- Developed as an **internship project**

## 👥 Developer and Team

### **Project Team**
- **Intern**: [Büşra Basan]
- **Company**: KUZUFLEX Metal Industry and Trade Inc.
- **Project**: Web Internship Project

### **Advisors**
- **Technical Advisor**: [Süleyman İBRAHİMBAŞ]
- **Project Manager**: [Süleyman İBRAHİMBAŞ]

This project is **completely redesigned** using modern web development technologies and **specially developed** for Kuzuflex company's needs. It provides transformation from a static website to a dynamic, manageable, and modern web application.

**🚀 Future Developments:**
- PWA (Progressive Web App) support
- Real-time notifications
- Advanced analytics dashboard
- API rate limiting and caching
- Microservices architecture
- Kubernetes deployment
