package com.jobgraph.jobgraph;

import java.util.Map;

import org.neo4j.driver.Driver;
import org.neo4j.driver.Session;
import org.neo4j.driver.Values;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "https://job-graph-frontend.vercel.app"
})
public class ApplicationController {

    private final Driver driver;

    public ApplicationController(Driver driver) {
        this.driver = driver;
    }

    @PostMapping
    public ResponseEntity<?> submitApplication(
            @RequestBody Map<String, String> application) {

        String name = application.get("name");
        String email = cleanEmail(application.get("email"));
        String jobTitle = application.get("jobTitle");
        String location = application.get("location");

        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Name is required")
            );
        }

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Email is required")
            );
        }

        if (jobTitle == null || jobTitle.isBlank()) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Job title is required")
            );
        }

        if (location == null || location.isBlank()) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Location is required")
            );
        }

        try (Session session = driver.session()) {

            String jobQuery = """
                    MATCH (j:Job {
                        title: $jobTitle,
                        location: $location
                    })
                    RETURN j
                    """;

            var jobResult = session.run(
                    jobQuery,
                    Values.parameters(
                            "jobTitle", jobTitle,
                            "location", location
                    )
            );

            if (!jobResult.hasNext()) {
                return ResponseEntity.badRequest().body(
                        Map.of(
                                "message", "Job not found",
                                "jobTitle", jobTitle,
                                "location", location
                        )
                );
            }

            jobResult.consume();

            String duplicateQuery = """
                    MATCH (a:Application)-[:APPLIED_FOR]->(j:Job)
                    WHERE a.email = $email
                      AND j.title = $jobTitle
                      AND j.location = $location
                    RETURN a.applicationId AS applicationId,
                           a.status AS status
                    ORDER BY a.appliedAt DESC
                    LIMIT 1
                    """;

            var duplicateResult = session.run(
                    duplicateQuery,
                    Values.parameters(
                            "email", email,
                            "jobTitle", jobTitle,
                            "location", location
                    )
            );

            if (duplicateResult.hasNext()) {

                var existing = duplicateResult.single();

                String existingStatus = "Applied";

                if (!existing.get("status").isNull()) {
                    existingStatus =
                            existing.get("status").asString();
                }

                return ResponseEntity.status(409).body(
                        Map.of(
                                "message",
                                "You have already applied for this job.",
                                "applicationId",
                                existing.get("applicationId").asString(),
                                "jobTitle",
                                jobTitle,
                                "location",
                                location,
                                "status",
                                existingStatus
                        )
                );
            }

            String createQuery = """
                    MATCH (j:Job {
                        title: $jobTitle,
                        location: $location
                    })

                    CREATE (a:Application {
                        applicationId: randomUUID(),
                        name: $name,
                        email: $email,
                        jobTitle: $jobTitle,
                        location: $location,
                        status: 'Applied',
                        appliedAt: datetime()
                    })

                    CREATE (a)-[:APPLIED_FOR]->(j)

                    RETURN
                        a.applicationId AS applicationId,
                        a.name AS name,
                        a.email AS email,
                        a.jobTitle AS jobTitle,
                        a.location AS location,
                        a.status AS status,
                        a.appliedAt AS appliedAt
                    """;

            var result = session.run(
                    createQuery,
                    Values.parameters(
                            "name", name,
                            "email", email,
                            "jobTitle", jobTitle,
                            "location", location
                    )
            );

            if (!result.hasNext()) {
                return ResponseEntity.badRequest().body(
                        Map.of(
                                "message",
                                "Unable to create application"
                        )
                );
            }

            var record = result.single();

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Application saved successfully",

                            "applicationId",
                            record.get("applicationId").asString(),

                            "name",
                            record.get("name").asString(),

                            "email",
                            cleanEmail(
                                    record.get("email").asString()
                            ),

                            "jobTitle",
                            record.get("jobTitle").asString(),

                            "location",
                            record.get("location").asString(),

                            "status",
                            record.get("status").asString()
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.internalServerError().body(
                    Map.of(
                            "message",
                            "Failed to save application",
                            "error",
                            e.getMessage()
                    )
            );
        }
    }

    @GetMapping
    public ResponseEntity<?> getApplications() {

        String query = """
                MATCH (a:Application)-[:APPLIED_FOR]->(j:Job)

                RETURN
                    a.applicationId AS applicationId,
                    a.name AS name,
                    a.email AS email,
                    a.jobTitle AS jobTitle,
                    a.location AS location,
                    a.status AS status,
                    a.appliedAt AS appliedAt,
                    j.salary AS salary

                ORDER BY a.appliedAt DESC
                """;

        try (Session session = driver.session()) {

            var result = session.run(query);

            var applications = result.list(record -> {

                String email = cleanEmail(
                        record.get("email").asString()
                );

                String status = "Applied";

                if (!record.get("status").isNull()) {
                    status =
                            record.get("status").asString();
                }

                return Map.of(
                        "applicationId",
                        record.get("applicationId").asString(),

                        "name",
                        record.get("name").asString(),

                        "email",
                        email,

                        "jobTitle",
                        record.get("jobTitle").asString(),

                        "location",
                        record.get("location").asString(),

                        "status",
                        status,

                        "appliedAt",
                        record.get("appliedAt").toString(),

                        "salary",
                        record.get("salary").asString()
                );
            });

            return ResponseEntity.ok(applications);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.internalServerError().body(
                    Map.of(
                            "message",
                            "Failed to load applications",
                            "error",
                            e.getMessage()
                    )
            );
        }
    }

    @PutMapping("/status")
    public ResponseEntity<?> updateApplicationStatus(
            @RequestBody Map<String, String> request) {

        String applicationId =
                request.get("applicationId");

        String status =
                request.get("status");

        if (applicationId == null
                || applicationId.isBlank()) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            "Application ID is required"
                    )
            );
        }

        if (status == null || status.isBlank()) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            "Status is required"
                    )
            );
        }

        if (!status.equals("Applied")
                && !status.equals("Shortlisted")
                && !status.equals("Rejected")
                && !status.equals("Selected")) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            "Invalid status",
                            "allowedStatuses",
                            "Applied, Shortlisted, Rejected, Selected"
                    )
            );
        }

        String query = """
                MATCH (a:Application)

                WHERE a.applicationId = $applicationId

                SET a.status = $status

                RETURN
                    a.applicationId AS applicationId,
                    a.name AS name,
                    a.email AS email,
                    a.jobTitle AS jobTitle,
                    a.location AS location,
                    a.status AS status,
                    a.appliedAt AS appliedAt
                """;

        try (Session session = driver.session()) {

            var result = session.run(
                    query,
                    Values.parameters(
                            "applicationId",
                            applicationId,

                            "status",
                            status
                    )
            );

            if (!result.hasNext()) {

                return ResponseEntity.badRequest().body(
                        Map.of(
                                "message",
                                "Application not found"
                        )
                );
            }

            var record = result.single();

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Application status updated successfully",

                            "applicationId",
                            record.get("applicationId").asString(),

                            "name",
                            record.get("name").asString(),

                            "email",
                            cleanEmail(
                                    record.get("email").asString()
                            ),

                            "jobTitle",
                            record.get("jobTitle").asString(),

                            "location",
                            record.get("location").asString(),

                            "status",
                            record.get("status").asString()
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.internalServerError().body(
                    Map.of(
                            "message",
                            "Failed to update application status",
                            "error",
                            e.getMessage()
                    )
            );
        }
    }

    private String cleanEmail(String email) {

        if (email == null || email.isEmpty()) {
            return "";
        }

        String value = email.trim();

        if (value.contains("[")
                && value.contains("]")) {

            int start =
                    value.indexOf("[") + 1;

            int end =
                    value.indexOf("]");

            if (end > start) {
                return value.substring(
                        start,
                        end
                );
            }
        }

        return value;
    }
}