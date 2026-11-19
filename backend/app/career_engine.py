
def calculate_career_match(career, student_skills):
    """
    Calculate career compatibility using weighted skill proficiency.

    student_skills:
        Dictionary containing skill_id: proficiency
    """

    total_weight = 0.0
    achieved_weight = 0.0

    skill_analysis = []

    for career_skill in career.career_skills:

        skill = career_skill.skill
        importance = career_skill.importance or 1.0

        proficiency = student_skills.get(skill.id, 0.0)

        total_weight += importance * 100
        achieved_weight += proficiency * importance

        gap = max(0.0, 100.0 - proficiency)

        skill_analysis.append({
            "skill": skill.name,
            "required_importance": importance,
            "student_proficiency": proficiency,
            "skill_gap": gap,
            "needs_improvement": proficiency < 60
        })

    if total_weight == 0:
        score = 0.0
    else:
        score = (achieved_weight / total_weight) * 100

    missing_skills = [
        item["skill"]
        for item in skill_analysis
        if item["needs_improvement"]
    ]

    return {
        "career_id": career.id,
        "career_title": career.title,
        "description": career.description,
        "match_score": round(score, 2),
        "skill_gaps": missing_skills,
        "skill_analysis": skill_analysis
    }


def generate_recommendations(careers, student_skills):

    recommendations = [
        calculate_career_match(career, student_skills)
        for career in careers
    ]

    recommendations.sort(
        key=lambda item: item["match_score"],
        reverse=True
    )

    return recommendations
