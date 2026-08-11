package com.jobgraph.jobgraph;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.neo4j.driver.Driver;
import org.neo4j.driver.Session;
import org.neo4j.driver.Record;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final Driver driver;

    public JobController(Driver driver) {
        this.driver = driver;
    }

    @GetMapping("/recommended")
    public ResponseEntity<List<Map<String, Object>>> getRecommendedJobs() {

        String cypher = """
            MATCH (u:User {name: "Rakesh"})-[:HAS_SKILL]->(s:Skill)<-[:REQUIRES]-(j:Job)
            WITH j, count(DISTINCT s) AS matchingSkills
            RETURN
                j.title AS title,
                j.location AS location,
                j.experienceRequired AS experienceRequired,
                j.salary AS salary,
                matchingSkills
            ORDER BY matchingSkills DESC
            """;

        try (Session session = driver.session()) {

            List<Map<String, Object>> jobs = session.executeRead(tx ->
                tx.run(cypher)
                  .list(Record::asMap)
            );

            return ResponseEntity.ok(jobs);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.internalServerError().build();
        }
    }
}