import regex as re

# Regex to identify CV sections
SECTION_REGEX = re.compile(
    r'(?im)^(experience|expériences professionnelles|work history|emploi|education|formation|skills|compétences)[\s:]*$'
)

# Robust regex to find date ranges anchoring an experience
# e.g., Jan 2020 - Present, 01/2020 to 12/2021, etc.
DATE_REGEX = re.compile(
    r'(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Janvier|Fevrier|Mars|Avril|Mai|Juin|Juillet|Aout|Septembre|Octobre|Novembre|Decembre|\d{2})[\/\-\s]*)?\d{4}\s*(?:-|to|à|au)\s*(?:Present|Présent|Aujourd\'hui|(?:(?:\w+[\/\-\s]*)?\d{4}))',
    re.IGNORECASE
)

# Predefined set of common tech skills
TECH_SKILLS_SEED = {
    "Python", "React", "Docker", "SQL", "Java", "CI/CD", "AWS", "FastAPI",
    "TypeScript", "Node.js", "JavaScript", "HTML", "CSS", "Git", "Kubernetes",
    "Linux", "Azure", "GCP", "C++", "C#", "Ruby", "Go", "Rust", "PHP",
    "Swift", "Kotlin", "Spring Boot", "Django", "Flask", "Vue.js", "Angular",
    "MongoDB", "PostgreSQL", "MySQL", "Redis", "Elasticsearch", "GraphQL",
    "REST API", "Terraform", "Ansible", "Jenkins", "GitHub Actions",
    "GitLab CI", "CircleCI", "Prometheus", "Grafana", "Splunk", "Datadog",
    "Spark", "Hadoop", "Kafka", "Airflow", "Tableau", "Power BI", "Snowflake",
    "Redshift", "BigQuery", "Machine Learning", "Deep Learning", "NLP",
    "Computer Vision", "TensorFlow", "PyTorch", "Scikit-Learn", "Pandas",
    "NumPy", "Matplotlib", "Seaborn", "Jupyter", "Bash", "Shell Scripting"
}
