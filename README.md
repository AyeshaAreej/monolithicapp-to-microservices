
# Node.js Microservices Deployed on EC2 Container Service

This is a reference architecture that shows the evolution of a Node.js application from a monolithic application that is deployed directly onto instances with no containerization or orchestration, to a containerized microservices architecture orchestrated using Amazon EC2 Container Service. This transformation enables better scalability, flexibility, and maintainability by breaking down the application into independent services. The architecture leverages Docker for containerization, Amazon ECS for orchestration, and AWS services such as Elastic Load Balancing and Auto Scaling to ensure high availability and performance. By adopting this approach, organizations can streamline deployments, improve fault isolation, and optimize resource utilization.

- [Part One: The base Node.js application](1-no-container/)
- [Part Two: Moving the application to a container deployed using ECS](2-containerized/)
- [Part Three: Breaking the monolith apart into microservices on ECS](3-microservices/)

