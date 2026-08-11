package com.jobgraph.jobgraph;

import org.neo4j.driver.AuthTokens;
import org.neo4j.driver.Driver;
import org.neo4j.driver.GraphDatabase;
import org.neo4j.driver.Session;

public class SeedDataLoader {

    public static void main(String[] args) {

        String uri = System.getenv("COGNODB_URI");
        String username = System.getenv("COGNODB_USERNAME");
        String password = System.getenv("COGNODB_PASSWORD");

        try (Driver driver = GraphDatabase.driver(
                uri,
                AuthTokens.basic(username, password))) {

            try (Session session = driver.session()) {

                session.run("""
                    CREATE (n:Test {
                        name: 'JobGraph Test'
                    })
                    """).consume();

                System.out.println("CognoDB WRITE SUCCESSFUL!");
            }

        } catch (Exception e) {
            System.out.println("CognoDB WRITE FAILED!");
            e.printStackTrace();
        }
    }
}