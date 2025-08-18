<img width="1912" height="934" alt="image" src="https://github.com/user-attachments/assets/75f63c65-72c4-4c78-a3b5-ab9d4a958c3b" /># 🚀 Kuzuflex Web Internship Project - Modern Web Application

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

![Database Relationship Schema]
<img width="1237" height="777" alt="image" src="https://github.com/user-attachments/assets/61775018-849f-4a06-922e-f1c4bb09d728" />


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
- **Development**: `http://localhost:5000/api-docs`

### **🔗 API Endpoints**

#### **Product Group Management**
<img width="1369" height="383" alt="image" src="https://github.com/user-attachments/assets/08b2a82d-dbeb-419a-b256-011591183da1" />

#### **Product Management**
<img width="1376" height="371" alt="image" src="https://github.com/user-attachments/assets/ac2cb751-06f6-4749-984e-99b155095677" />

#### **Solutions Management**
<img width="1363" height="422" alt="image" src="https://github.com/user-attachments/assets/5775d354-c8f6-46ad-85e0-6c8702d886f7" />

#### **Solution's Extra Content Management**
<img width="1350" height="461" alt="image" src="https://github.com/user-attachments/assets/f8df1eb2-ad5d-4fbe-aa01-6b9316820e5f" />

#### **Market Management**
<img width="1362" height="456" alt="image" src="https://github.com/user-attachments/assets/1035d84b-0c70-43ee-b75d-b872bebdc1a2" />

#### **Market's Content Management**
<img width="1379" height="265" alt="image" src="https://github.com/user-attachments/assets/1b6d028c-2a44-4933-a6d2-cd9fce14a946" />

#### **Authentication**
<img width="1381" height="574" alt="image" src="https://github.com/user-attachments/assets/89956aba-6bd2-4d07-8457-7e146a0260dd" />

#### **Email Settings**
<img width="1370" height="217" alt="image" src="https://github.com/user-attachments/assets/8d38e49b-a240-4048-b32c-0882a864746a" />

#### **Contact**
<img width="1363" height="211" alt="image" src="https://github.com/user-attachments/assets/c7ed1f3c-38b5-4642-b840-8c4e892f24ec" />

#### **Home**
<img width="1397" height="115" alt="image" src="https://github.com/user-attachments/assets/0c8b2c6a-de58-46ac-a110-62af7c040f67" />

#### **Catalogs Managements**
<img width="1384" height="267" alt="image" src="https://github.com/user-attachments/assets/bce6ebc7-ee41-4280-9a60-40e028228e64" />

#### **About Page Managements**
<img width="1368" height="359" alt="image" src="https://github.com/user-attachments/assets/4ce35ee8-840b-41bc-ae62-ba9a445dff04" />

#### **About Page Extra Content Managements**
<img width="1391" height="478" alt="image" src="https://github.com/user-attachments/assets/467f7979-bea1-4029-8b77-de5559489b00" />

#### **Documents and Certificates Managements**
<img width="1371" height="319" alt="image" src="https://github.com/user-attachments/assets/32cf3dc0-1fc1-4939-bf9d-fbae1e67ffea" />
<img width="1371" height="110" alt="image" src="https://github.com/user-attachments/assets/75074250-e495-4c30-9df6-5b2c0a1efb51" />



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
<img width="1920" height="1022" alt="image" src="https://github.com/user-attachments/assets/ef86a9d2-0b15-4302-9f7b-2d45b894091b" />
<img width="1918" height="1032" alt="image" src="https://github.com/user-attachments/assets/78ee14c3-0c8b-4e22-bc07-80d020f0ea75" />
<img width="1916" height="1029" alt="image" src="https://github.com/user-attachments/assets/a84fc6d0-35b1-4244-8f89-42fec7bcfbe0" />
<img width="1920" height="1029" alt="image" src="https://github.com/user-attachments/assets/0344864b-6ddf-4bf0-9bd1-59dd7405fcee" />
<img width="1920" height="1028" alt="image" src="https://github.com/user-attachments/assets/8968c934-281d-4acc-8ba7-d032a224041b" />
<img width="1918" height="1029" alt="image" src="https://github.com/user-attachments/assets/837a58a6-bfd0-4901-99e3-40ca8db804aa" />
<img width="1909" height="881" alt="image" src="https://github.com/user-attachments/assets/aa1eddcd-1751-491f-ac5f-e5c289d18b68" />
<img width="1920" height="1026" alt="image" src="https://github.com/user-attachments/assets/03d013b1-e4aa-4c19-bc37-4daf627d8f18" />
<img width="1917" height="1029" alt="image" src="https://github.com/user-attachments/assets/b867ccdc-4d41-4627-b879-c6555823dce2" />
<img width="1915" height="1022" alt="image" src="https://github.com/user-attachments/assets/6d00abba-974f-4863-acc1-cfdd370c1171" />
<img width="1920" height="1027" alt="image" src="https://github.com/user-attachments/assets/87e799f9-0099-4235-914d-cb88e4d19d46" />

### **Product Group**
<img width="1920" height="1027" alt="image" src="https://github.com/user-attachments/assets/9f64866a-df9d-4b8b-ab26-c17173304748" />
<img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/ca0ffebb-a86e-4d05-9a5d-72c42c98d6e6" />

### **Product**
<img width="1917" height="1025" alt="image" src="https://github.com/user-attachments/assets/a7464f3b-79dd-4286-b527-f0152441024b" />
<img width="1916" height="1028" alt="image" src="https://github.com/user-attachments/assets/ec27362c-8eb2-4cc2-8198-c0555cdc2963" />

### **Documents and Certificates**
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/16646493-25a0-4952-8194-7730f738b5c9" />
<img width="1920" height="1026" alt="image" src="https://github.com/user-attachments/assets/64325702-55f4-4183-a77b-493638439644" />

### **Solutions Page**
<img width="1920" height="1030" alt="image" src="https://github.com/user-attachments/assets/8769bab8-4aa9-4d48-bc8e-eace9b245166" />
<img width="1918" height="1022" alt="image" src="https://github.com/user-attachments/assets/59e015c2-1276-47fd-a6d4-5738c5a3408f" />
<img width="1914" height="1024" alt="image" src="https://github.com/user-attachments/assets/cb889afe-a012-4ccc-8770-fe9e3a55786f" />
<img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/cf63c6ba-c0b1-4613-b62e-2623195dd106" />
<img width="1915" height="1025" alt="image" src="https://github.com/user-attachments/assets/4c4eb5ac-3c3f-47ce-89da-30a4062bef6d" />


### **About-us Page**
<img width="1919" height="1032" alt="image" src="https://github.com/user-attachments/assets/67e95058-a4c7-4d24-bdc5-0b97838ee0b9" />
<img width="1920" height="1029" alt="image" src="https://github.com/user-attachments/assets/d7756c50-9114-4c92-852a-6e675b20e903" />
<img width="1912" height="1023" alt="image" src="https://github.com/user-attachments/assets/1c9808c1-c60e-4d7c-a1d8-6133fd64ef55" />

### **Contact Page**
<img width="1919" height="1029" alt="image" src="https://github.com/user-attachments/assets/7cb98d25-6fd9-4b01-8179-c18e7ba1d80e" />
<img width="1918" height="1027" alt="image" src="https://github.com/user-attachments/assets/c5e8d72e-0b4b-4294-b7e6-8b7832537cae" />


### **Markets**
<img width="1919" height="1030" alt="image" src="https://github.com/user-attachments/assets/87372224-6ec8-4802-b9a4-97faef5612ea" />


### **Admin Login**
<img width="1913" height="925" alt="image" src="https://github.com/user-attachments/assets/1462ab3a-a20f-4143-8c7c-c9b2f24e4e37" />
<img width="1912" height="934" alt="image" src="https://github.com/user-attachments/assets/e1a49adc-ab41-4902-be99-644335433833" />


### **Admin Panel**
<img width="1904" height="932" alt="image" src="https://github.com/user-attachments/assets/95885b64-ec62-4003-be9d-9e2a2475fea1" />

### **Admin Profile**
<img width="1905" height="934" alt="image" src="https://github.com/user-attachments/assets/fdb7ea02-cbc4-4cff-a10b-0d1d3f55f6fe" />
<img width="1904" height="933" alt="image" src="https://github.com/user-attachments/assets/639816ce-b084-4a3a-ade7-c173a7d21c50" />


### **Product Group Management**
<img width="1887" height="926" alt="image" src="https://github.com/user-attachments/assets/a2adc8ef-7753-43f3-86d3-3f6d6656193f" />
<img width="1916" height="1025" alt="image" src="https://github.com/user-attachments/assets/67f14ea6-efb5-412d-9529-3d9de6001145" />

### **Product Management**
<img width="1920" height="933" alt="image" src="https://github.com/user-attachments/assets/3ed22fd4-2e37-4df9-a662-b1ef033045db" />
<img width="1903" height="931" alt="image" src="https://github.com/user-attachments/assets/2eadaea5-e299-4625-a4fc-943ff5907a13" />
<img width="1916" height="931" alt="image" src="https://github.com/user-attachments/assets/866c8154-3ecc-4cb8-97fe-3bcabb73a8f5" />


### **Solution Management**
<img width="1907" height="931" alt="image" src="https://github.com/user-attachments/assets/10c4e774-e9db-47cc-828c-7c0e9ec8f94a" />

### **SolutionExtra Content Management**
<img width="1906" height="950" alt="image" src="https://github.com/user-attachments/assets/3b5ae2b4-6d3c-41c4-866e-da46a14189c0" />
<img width="1912" height="940" alt="image" src="https://github.com/user-attachments/assets/ea8417bb-f949-45e8-9b7c-2c63ea764ae8" />
<img width="1916" height="936" alt="image" src="https://github.com/user-attachments/assets/6fb6b436-6ea1-4e5a-8a95-46be414dfcbb" />
<img width="1904" height="920" alt="image" src="https://github.com/user-attachments/assets/f9112960-bdb6-4ff7-8f1c-a97275183344" />

### **Documents and Certificates Management**
<img width="1915" height="943" alt="image" src="https://github.com/user-attachments/assets/3c34e448-f94d-4d8b-8bf2-0187ef064611" />
<img width="1908" height="932" alt="image" src="https://github.com/user-attachments/assets/fa0155f2-e0a4-476d-84c5-8125bbb47738" />


### **Market Management**
<img width="1918" height="941" alt="image" src="https://github.com/user-attachments/assets/00b9d5e3-67bb-44fe-8a98-38af244be9b5" />


### **Responsive Design**
![Mobile View](docs/screenshots/mobile-view.png)

## 👨‍💼 Admin Panel

### **Access**
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
