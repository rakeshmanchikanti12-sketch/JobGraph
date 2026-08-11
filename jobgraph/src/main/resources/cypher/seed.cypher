// Clear existing data
MATCH (n)
DETACH DELETE n;

// Companies
CREATE (c1:Company {
    name: 'TechNova Solutions',
    location: 'Hyderabad',
    industry: 'Information Technology'
});

CREATE (c2:Company {
    name: 'CloudMatrix Technologies',
    location: 'Bangalore',
    industry: 'Software'
});

CREATE (c3:Company {
    name: 'DataBridge Systems',
    location: 'Hyderabad',
    industry: 'Data Analytics'
});

// Skills
CREATE (s1:Skill {name: 'Java', category: 'Programming'});
CREATE (s2:Skill {name: 'SQL', category: 'Database'});
CREATE (s3:Skill {name: 'React', category: 'Frontend'});
CREATE (s4:Skill {name: 'Spring Boot', category: 'Backend'});
CREATE (s5:Skill {name: 'JavaScript', category: 'Programming'});

// Jobs
CREATE (j1:Job {
    title: 'Java Developer',
    location: 'Hyderabad',
    experienceRequired: '0-2 years',
    salary: '4-6 LPA'
});

CREATE (j2:Job {
    title: 'Full Stack Developer',
    location: 'Bangalore',
    experienceRequired: '0-2 years',
    salary: '5-8 LPA'
});

CREATE (j3:Job {
    title: 'Backend Developer',
    location: 'Hyderabad',
    experienceRequired: '0-2 years',
    salary: '4-7 LPA'
});

// User
CREATE (u1:User {
    name: 'Rakesh',
    email: 'rakesh@example.com',
    experience: 'Fresher'
});

// User skills
CREATE (u1)-[:HAS_SKILL]->(s1);
CREATE (u1)-[:HAS_SKILL]->(s2);
CREATE (u1)-[:HAS_SKILL]->(s3);
CREATE (u1)-[:HAS_SKILL]->(s5);

// Job requirements
CREATE (j1)-[:REQUIRES]->(s1);
CREATE (j1)-[:REQUIRES]->(s2);
CREATE (j1)-[:REQUIRES]->(s4);

CREATE (j2)-[:REQUIRES]->(s1);
CREATE (j2)-[:REQUIRES]->(s2);
CREATE (j2)-[:REQUIRES]->(s3);
CREATE (j2)-[:REQUIRES]->(s5);

CREATE (j3)-[:REQUIRES]->(s1);
CREATE (j3)-[:REQUIRES]->(s2);
CREATE (j3)-[:REQUIRES]->(s4);

// Companies offer jobs
CREATE (c1)-[:OFFERS]->(j1);
CREATE (c2)-[:OFFERS]->(j2);
CREATE (c3)-[:OFFERS]->(j3);	