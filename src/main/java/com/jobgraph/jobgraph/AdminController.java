package com.jobgraph.jobgraph;

import java.util.Map;

import org.neo4j.driver.Driver;
import org.neo4j.driver.Session;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    private final Driver driver;

    public AdminController(Driver driver) {
        this.driver = driver;
    }

    @GetMapping("/applications")
    public ResponseEntity<?> getAllApplications() {

        String query = """
                MATCH (a:Application)-[:APPLIED_FOR]->(j:Job)

                RETURN
                    a.name AS name,
                    a.email AS email,
                    a.jobTitle AS jobTitle,
                    a.location AS location,
                    a.appliedAt AS appliedAt,
                    j.salary AS salary

                ORDER BY a.appliedAt DESC
                """;

        try (Session session = driver.session()) {

            var result = session.run(query);

            var applications = result.list(record -> {

                return Map.of(
                        "name", record.get("name").asString(),
                        "email", record.get("email").asString(),
                        "jobTitle", record.get("jobTitle").asString(),
                        "location", record.get("location").asString(),
                        "appliedAt", record.get("appliedAt").toString(),
                        "salary", record.get("salary").asString()
                );
            });

            return ResponseEntity.ok(applications);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.internalServerError().body(
                    Map.of(
                            "message", "Failed to load admin applications",
                            "error", e.getMessage()
                    )
            );
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {

        String totalApplicationsQuery = """
                MATCH (a:Application)
                RETURN count(a) AS totalApplications
                """;

        String totalJobsQuery = """
                MATCH (j:Job)
                RETURN count(j) AS totalJobs
                """;

        try (Session session = driver.session()) {

            var applicationsResult =
                    session.run(totalApplicationsQuery).single();

            var jobsResult =
                    session.run(totalJobsQuery).single();

            long totalApplications =
                    applicationsResult.get("totalApplications").asLong();

            long totalJobs =
                    jobsResult.get("totalJobs").asLong();

            return ResponseEntity.ok(
                    Map.of(
                            "totalApplications", totalApplications,
                            "totalJobs", totalJobs
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.internalServerError().body(
                    Map.of(
                            "message", "Failed to load statistics",
                            "error", e.getMessage()
                    )
            );
        }
    }
}