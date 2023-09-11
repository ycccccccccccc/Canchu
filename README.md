# Canchu - let's be friends

## This project
#### In the summer of 2023, I completed the backend implementation of a social networking software. It allows users to create profiles, make friends, and post updates. Here are some key features:

* I set up the environment using Docker, ensuring it's not bound by specific computer operating systems.
* To ensure system stability, I implemented Cache to save resources and implemented IP traffic control.
* Advanced Load Balancing techniques were implemented to enhance system performance, and K6 was used to monitor system performance and usage.
* Through GitHub Actions, I practiced CI/CD, accelerating the software development lifecycle while ensuring code quality.

## How to reproduce the project?
### Recommended to run on AWS (EC2)
1. Download Canchu from https://github.com/ycccccccccccc/Canchu
2. Navigate to the backend directory using the command cd backend
3. Configure the `.env` parameters: `SECRET` for JWT, `DB_password`, and `DB_host` for MySQL.
4. Create a folder named `private`, then add SSL key files named `certificate.crt` and `private.key`.
5. Run `docker-compose up --build`.
6. Congratulations! You can test it using Postman at `https://<ssl-url>/<API>`. For example, `https://13.238.130.147/users/signup`. This is the URL format.

## In this project, I learned and utilized the following skills:
### Programming Language
1. JavaScript

### Backend Environment and Framework
1. Linux
2. Node.js
3. Express.js

### SQL Database
1. CRUD Operations: MySQL
2. Indexing, Primary Key, Foreign Key and Joins
3. Transaction and ACID
4. Data Model: One-to-One, One-to-Many, Many-to-Many
5. Database Normalization
6. Security and SQL Injection. 

### Cloud Service
1. AWS EC2 and RDS
2. AWS AMI and Load Balancer

### Parallel Computing
1. Multi-Threaded Programming
2. Race Condition and Deadlock

### Networking
1. TCP/IP Protocol
2. HTTP and HTTPS
3. Domain Name System (DNS)
4. Public-Key Cryptography
5. Cache Mechanism

### Key Concepts
1. Version Control: Git, Github
2. Asynchronous: callback, Promise and async/await 
3. Javascript Event Loop
4. MVC design pattern
5. RESTful APIs
6. Unit Test
7. CI/CD: Github actions
8. OOP and Functional Programming
9. Availability and Scalability
10. Coding styles and Code Readability
