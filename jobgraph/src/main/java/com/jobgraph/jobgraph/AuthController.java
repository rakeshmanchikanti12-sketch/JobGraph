package com.jobgraph.jobgraph;

import java.util.Map;

import org.neo4j.driver.Driver;
import org.neo4j.driver.Session;
import org.neo4j.driver.Values;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "https://job-graph-frontend.vercel.app"
})
public class AuthController {

    private final Driver driver;

    public AuthController(Driver driver) {
        this.driver = driver;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {

        if (user.getName() == null || user.getName().isBlank()
                || user.getEmail() == null || user.getEmail().isBlank()
                || user.getPassword() == null || user.getPassword().isBlank()) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            "Name, email and password are required"
                    ));
        }

        try (Session session = driver.session()) {

            String email = user.getEmail().trim().toLowerCase();

            String checkQuery = """
                    MATCH (u:User {email: $email})
                    RETURN u
                    """;

            var checkResult = session.run(
                    checkQuery,
                    Values.parameters("email", email)
            );

            if (checkResult.hasNext()) {

                return ResponseEntity
                        .status(HttpStatus.CONFLICT)
                        .body(Map.of(
                                "message",
                                "Email already registered"
                        ));
            }

            String role = "USER";

            if (email.equals("admin@gmail.com")) {
                role = "ADMIN";
            }

            String query = """
                    CREATE (u:User {
                        name: $name,
                        email: $email,
                        password: $password,
                        role: $role
                    })
                    RETURN
                        u.name AS name,
                        u.email AS email,
                        u.role AS role
                    """;

            var result = session.run(
                    query,
                    Values.parameters(
                            "name", user.getName().trim(),
                            "email", email,
                            "password", user.getPassword(),
                            "role", role
                    )
            );

            var record = result.single();

            return ResponseEntity.ok(
                    Map.of(
                            "name",
                            record.get("name").asString(),

                            "email",
                            record.get("email").asString(),

                            "role",
                            record.get("role").asString()
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(Map.of(
                            "message",
                            "Signup failed",

                            "error",
                            e.getMessage()
                    ));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {

        if (user.getEmail() == null || user.getEmail().isBlank()
                || user.getPassword() == null || user.getPassword().isBlank()) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            "Email and password are required"
                    ));
        }

        try (Session session = driver.session()) {

            String email = user.getEmail().trim().toLowerCase();

            String query = """
                    MATCH (u:User {email: $email})
                    RETURN
                        u.name AS name,
                        u.email AS email,
                        u.password AS password,
                        u.role AS role
                    """;

            var result = session.run(
                    query,
                    Values.parameters("email", email)
            );

            if (!result.hasNext()) {

                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of(
                                "message",
                                "Invalid email or password"
                        ));
            }

            var record = result.single();

            String storedPassword =
                    record.get("password").asString();

            if (!storedPassword.equals(user.getPassword())) {

                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of(
                                "message",
                                "Invalid email or password"
                        ));
            }

            String role = "USER";

            if (!record.get("role").isNull()) {
                role = record.get("role").asString();
            } else if (email.equals("admin@gmail.com")) {
                role = "ADMIN";

                String updateRoleQuery = """
                        MATCH (u:User {email: $email})
                        SET u.role = "ADMIN"
                        """;

                session.run(
                        updateRoleQuery,
                        Values.parameters("email", email)
                );
            }

            return ResponseEntity.ok(
                    Map.of(
                            "name",
                            record.get("name").asString(),

                            "email",
                            record.get("email").asString(),

                            "role",
                            role
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(Map.of(
                            "message",
                            "Login failed",

                            "error",
                            e.getMessage()
                    ));
        }
    }
}