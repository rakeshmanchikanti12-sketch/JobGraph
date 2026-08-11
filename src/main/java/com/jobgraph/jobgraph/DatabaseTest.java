package com.jobgraph.jobgraph;

import org.neo4j.driver.AuthTokens;
import org.neo4j.driver.Driver;
import org.neo4j.driver.GraphDatabase;
import org.neo4j.driver.Session;

import java.nio.file.Files;
import java.nio.file.Path;

public class DatabaseTest {

    public static void main(String[] args) {

        String uri = System.getenv("COGNODB_URI");
        String username = System.getenv("COGNODB_USERNAME");
        String password = System.getenv("COGNODB_PASSWORD");

        try (Driver driver = GraphDatabase.driver(
                uri,
                AuthTokens.basic(username, password))) {

            try (Session session = driver.session()) {

                System.out.println("Connected to CognoDB.");

                String cypher = Files.readString(
                        Path.of("src/main/resources/cypher/seed.cypher"));

                String[] queries = cypher.split(";");

                int count = 0;

                for (String query : queries) {

                    query = query.trim();

                    if (query.isEmpty()) {
                        continue;
                    }

                    session.run(query).consume();

                    count++;

                    System.out.println("Query executed: " + count);
                }

                System.out.println();
                System.out.println("Seed data loaded successfully!");
                System.out.println("Total queries: " + count);
            }

        } catch (Exception e) {

            System.out.println("Seed loading failed!");
            e.printStackTrace();
        }
    }
}