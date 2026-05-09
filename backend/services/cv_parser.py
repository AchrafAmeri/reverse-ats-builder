import re
import io
from datetime import datetime
from pypdf import PdfReader
from sqlalchemy.orm import Session
import models

def parse_cv_pdf(file_bytes: bytes, db_session: Session):
    reader = PdfReader(io.BytesIO(file_bytes))
    text = ""
    for page in reader.pages:
        extracted = page.extract_text()
        if extracted:
            text += extracted + "\n"

    # Extract Skills
    all_skills = db_session.query(models.Skill).all()
    matched_skills = []
    text_lower = text.lower()

    # We use word boundaries to avoid matching substrings
    for skill in all_skills:
        skill_name_lower = skill.name.lower()
        # Escape special characters in skill names
        escaped_skill = re.escape(skill_name_lower)
        pattern = r'\b' + escaped_skill + r'\b'
        if re.search(pattern, text_lower):
            matched_skills.append(skill)

    # Extract Experiences
    # Heuristic: (20\d{2})\s*-\s*(20\d{2}|Present)
    # We split the text by these date ranges to find the blocks of text associated with them.
    # A robust way is to find all matches and their positions.
    date_pattern = r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|[a-zA-Z]+)?\s*20\d{2})\s*-\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|[a-zA-Z]+)?\s*20\d{2}|Present|present|Current|current)'

    experiences = []

    # Simple heuristic: look for date ranges. The text *before* the date might be the title/company,
    # or the text *after* the date. Let's try to extract lines with dates, and the lines following as description.
    lines = [line.strip() for line in text.split('\n') if line.strip()]

    i = 0
    while i < len(lines):
        line = lines[i]
        # Basic date match: 20xx - 20xx or 20xx - Present
        match = re.search(r'(20\d{2})\s*[-to]+\s*(20\d{2}|[pP]resent|[cC]urrent)', line)
        if match:
            start_year = match.group(1)
            end_year_str = match.group(2)

            # Create a basic date (January 1st of the year)
            try:
                start_date = datetime.strptime(start_year, "%Y").date()
            except ValueError:
                start_date = datetime.now().date()

            end_date = None
            if end_year_str.lower() not in ['present', 'current']:
                try:
                    end_date = datetime.strptime(end_year_str, "%Y").date()
                except ValueError:
                    pass

            # The title and company might be on this line or the previous line
            title_company_line = line
            # Remove the date from the line to get title/company
            title_company_text = re.sub(r'(20\d{2})\s*[-to]+\s*(20\d{2}|[pP]resent|[cC]urrent)', '', line).strip()

            if not title_company_text and i > 0:
                title_company_text = lines[i-1]

            # Split title and company (often separated by comma, dash, or pipe)
            parts = re.split(r'[,|\-]', title_company_text, maxsplit=1)
            title = parts[0].strip() if parts else "Unknown Title"
            company = parts[1].strip() if len(parts) > 1 else "Unknown Company"
            if not title:
                title = "Unknown Title"

            # Description is the following lines until the next date or empty line (or we just take 2-3 lines)
            desc_lines = []
            j = i + 1
            while j < len(lines) and j < i + 5: # Limit description to avoid taking too much
                next_line = lines[j]
                if re.search(r'(20\d{2})\s*[-to]+\s*(20\d{2}|[pP]resent|[cC]urrent)', next_line):
                    break
                desc_lines.append(next_line)
                j += 1

            description = " ".join(desc_lines)

            experiences.append({
                "title": title[:255] if title else "Experience", # limit length
                "company": company[:255] if company else "Company",
                "start_date": start_date,
                "end_date": end_date,
                "description": description
            })

            i = j - 1 # Skip processed lines
        i += 1

    return {
        "skills": matched_skills,
        "experiences": experiences
    }
