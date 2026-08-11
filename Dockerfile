FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY . .

RUN apt-get update && apt-get install -y maven

RUN mvn clean package -DskipTests

EXPOSE 8081

CMD ["java", "-jar", "target/jobgraph-0.0.1-SNAPSHOT.jar"]