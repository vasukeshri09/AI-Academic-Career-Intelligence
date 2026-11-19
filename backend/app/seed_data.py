
from .database import SessionLocal
from .models import Skill, Career, CareerSkill


SKILLS = {
    "Python": "Programming",
    "SQL": "Database",
    "Statistics": "Mathematics",
    "Machine Learning": "Artificial Intelligence",
    "Deep Learning": "Artificial Intelligence",
    "Data Visualization": "Data Analytics",
    "Java": "Programming",
    "Data Structures and Algorithms": "Computer Science",
    "REST APIs": "Backend Development",
    "Git": "Development Tools",
    "Communication": "Soft Skills",
    "Cloud Computing": "Infrastructure"
}


CAREERS = {
    "Data Scientist": {
        "description": "Analyze data, build predictive models and discover insights.",
        "skills": {
            "Python": 1.0,
            "SQL": 0.9,
            "Statistics": 1.0,
            "Machine Learning": 0.9,
            "Data Visualization": 0.7
        }
    },

    "Machine Learning Engineer": {
        "description": "Develop and deploy intelligent machine learning systems.",
        "skills": {
            "Python": 1.0,
            "Machine Learning": 1.0,
            "Deep Learning": 0.9,
            "Statistics": 0.7,
            "SQL": 0.5,
            "Git": 0.5
        }
    },

    "Software Engineer": {
        "description": "Design and develop scalable software applications.",
        "skills": {
            "Java": 0.9,
            "Python": 0.7,
            "Data Structures and Algorithms": 1.0,
            "SQL": 0.7,
            "Git": 0.7,
            "Communication": 0.5
        }
    },

    "Data Analyst": {
        "description": "Analyze business data and communicate actionable insights.",
        "skills": {
            "SQL": 1.0,
            "Python": 0.8,
            "Statistics": 0.8,
            "Data Visualization": 1.0,
            "Communication": 0.7
        }
    },

    "Backend Developer": {
        "description": "Build server-side applications, APIs and database systems.",
        "skills": {
            "Python": 0.8,
            "Java": 0.7,
            "SQL": 0.9,
            "REST APIs": 1.0,
            "Git": 0.8,
            "Data Structures and Algorithms": 0.6
        }
    }
}


def seed_database():
    db = SessionLocal()

    try:
        skill_objects = {}

        # Insert skills
        for skill_name, category in SKILLS.items():

            skill = (
                db.query(Skill)
                .filter(Skill.name == skill_name)
                .first()
            )

            if skill is None:
                skill = Skill(
                    name=skill_name,
                    category=category
                )
                db.add(skill)
                db.flush()

            skill_objects[skill_name] = skill

        # Insert careers and career requirements
        for career_name, details in CAREERS.items():

            career = (
                db.query(Career)
                .filter(Career.title == career_name)
                .first()
            )

            if career is None:
                career = Career(
                    title=career_name,
                    description=details["description"]
                )
                db.add(career)
                db.flush()

            for skill_name, importance in details["skills"].items():

                skill = skill_objects[skill_name]

                existing = (
                    db.query(CareerSkill)
                    .filter(
                        CareerSkill.career_id == career.id,
                        CareerSkill.skill_id == skill.id
                    )
                    .first()
                )

                if existing is None:
                    db.add(
                        CareerSkill(
                            career_id=career.id,
                            skill_id=skill.id,
                            importance=importance
                        )
                    )

        db.commit()

        print("Career and skill data seeded successfully!")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
