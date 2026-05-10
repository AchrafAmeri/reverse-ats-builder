import regex as re
import io
from datetime import datetime
from pypdf import PdfReader
from sqlalchemy.orm import Session
import models
from utils.cv_heuristics import SECTION_REGEX, DATE_REGEX, TECH_SKILLS_SEED

def parse_cv_pdf(file_bytes: bytes, db_session: Session = None):
    reader = PdfReader(io.BytesIO(file_bytes))
    text = ""
    for page in reader.pages:
        extracted = page.extract_text()
        if extracted:
            text += extracted + "\n"

    # 1. Clean Text: remove excessive whitespace but preserve newlines
    text = re.sub(r'[ \t]+', ' ', text)

    # 2. Segmentation
    # Split text by SECTION_REGEX
    sections = {}
    current_section = "general"
    lines = text.split("\n")
    section_lines = {current_section: []}

    for line in lines:
        stripped_line = line.strip()
        if not stripped_line:
            continue

        match = SECTION_REGEX.match(stripped_line)
        if match:
            current_section = match.group(1).lower()
            if current_section not in section_lines:
                section_lines[current_section] = []
        else:
            section_lines[current_section].append(stripped_line)

    experience_lines = []
    # Combine lines for all experience-related sections
    for sec in ["experience", "expériences professionnelles", "work history", "emploi"]:
        if sec in section_lines:
            experience_lines.extend(section_lines[sec])

    # If no explicit experience section was found, we might fallback to all lines
    if not experience_lines:
        experience_lines = [line.strip() for line in lines if line.strip()]

    # 3. Experience Extraction (Date Anchoring)
    experiences = []

    # We will split the experience lines into chunks using the DATE_REGEX
    experience_text = "\n".join(experience_lines)

    # Find all date matches
    matches = list(DATE_REGEX.finditer(experience_text))

    for idx, match in enumerate(matches):
        start_idx = match.start()
        # The chunk goes from the beginning of the line containing the match up to the next match
        chunk_start = experience_text.rfind('\n', 0, start_idx)
        if chunk_start == -1:
            chunk_start = 0
        else:
            chunk_start += 1 # skip newline

        if idx + 1 < len(matches):
            next_start = matches[idx+1].start()
            chunk_end = experience_text.rfind('\n', start_idx, next_start)
            if chunk_end == -1:
                chunk_end = next_start
        else:
            chunk_end = len(experience_text)

        chunk_text = experience_text[chunk_start:chunk_end].strip()
        date_str = match.group(0)

        # Parse the date string simply to extract a rough start/end date
        # Fallback logic for date parsing
        start_date = datetime.now().date()
        end_date = None

        # very basic date year extraction
        years = re.findall(r'\d{4}', date_str)
        if years:
            try:
                start_date = datetime.strptime(years[0], "%Y").date()
            except ValueError:
                pass

            if len(years) > 1:
                try:
                    end_date = datetime.strptime(years[1], "%Y").date()
                except ValueError:
                    pass

        # The first line before or after the date might be the title/company
        chunk_lines = chunk_text.split('\n')
        title_company_text = "Unknown Title"

        # Try to find a non-date line for title/company
        for cl in chunk_lines:
            if not DATE_REGEX.search(cl) and len(cl.strip()) > 3:
                title_company_text = cl.strip()
                break

        # Split title and company
        parts = re.split(r'[,|\-]', title_company_text, maxsplit=1)
        title = parts[0].strip() if parts else "Unknown Title"
        company = parts[1].strip() if len(parts) > 1 else "Unknown Company"

        # Description is the rest
        desc_lines = [cl.strip() for cl in chunk_lines if cl.strip() != title_company_text and not DATE_REGEX.search(cl)]
        description = " ".join(desc_lines)

        experiences.append({
            "title": title[:255] if title else "Experience",
            "company": company[:255] if company else "Company",
            "start_date": start_date,
            "end_date": end_date,
            "description": description
        })

    # 4. Skill Extraction: Scan entire text against TECH_SKILLS_SEED
    matched_skills_names = set()
    text_lower = text.lower()

    for skill in TECH_SKILLS_SEED:
        escaped_skill = re.escape(skill.lower())
        pattern = r'\b' + escaped_skill + r'\b'
        if re.search(pattern, text_lower):
            matched_skills_names.add(skill)

    # For matching to DB objects if a DB session is provided (for backwards compatibility/ease)
    matched_skills = []
    if db_session:
        # Actually this will be handled in the router according to instructions,
        # but we return the raw strings as well or mock models if needed.
        pass

    return {
        "skills": list(matched_skills_names),
        "experiences": experiences
    }
