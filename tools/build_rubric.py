"""Separate POE marking rubric sheet to attach to the submission (as the brief asks)."""
import os
from docx import Document
from docx.shared import Pt, Cm
from docx.enum.section import WD_ORIENT
from docx.oxml.ns import qn
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'HCIN6222_POE_Rubric_Manuel_Mavungo_ST10466974.docx')
d = Document()
s = d.sections[0]
s.orientation = WD_ORIENT.LANDSCAPE
s.page_width, s.page_height = Cm(29.7), Cm(21.0)
for m in ('left_margin', 'right_margin', 'top_margin', 'bottom_margin'):
    setattr(s, m, Cm(1.5))
st = d.styles['Normal']; st.font.name = 'Arial'; st.font.size = Pt(9)
st.element.rPr.rFonts.set(qn('w:eastAsia'), 'Arial')
p = d.add_paragraph(); r = p.add_run('HCIN6222 Human Computer Interaction: POE rubric'); r.bold = True; r.font.size = Pt(13)
d.add_paragraph('Student name: Manuel Mavungo    Student number: ST10466974')
rows = [
 ('GENERAL: Language usage, referencing, and editing of the document', '8-10', '6-7', '5', '0-4'),
 ('Revised: Description of website functionality', '5', '3-4', '1-2', '0'),
 ('Revised: Usability goals', '5', '3-4', '1-2', '0'),
 ('Revised: Desirable aspects of user experience', '5', '3-4', '1-2', '0'),
 ('Revised: Design principles', '5', '3-4', '1-2', '0'),
 ('Revised: Interaction types', '5', '3-4', '1-2', '0'),
 ('Revised: Social interactions', '5', '3-4', '1-2', '0'),
 ('Revised: Emotional interaction', '5', '3-4', '1-2', '0'),
 ('Revised: Web Content Accessibility and Guidelines (WCAG) 2.0', '5', '3-4', '1-2', '0'),
 ('Revised: Prototype', '5', '3-4', '1-2', '0'),
 ('Prototype: Usability goals', '5', '3-4', '1-2', '0'),
 ('Prototype: Desirable aspects of user experience', '5', '3-4', '1-2', '0'),
 ('Prototype: Design principles', '5', '3-4', '1-2', '0'),
 ('Prototype: Interaction types', '5', '3-4', '1-2', '0'),
 ('Prototype: Social interactions', '5', '3-4', '1-2', '0'),
 ('Prototype: Emotional interaction', '5', '3-4', '1-2', '0'),
 ('Prototype: Web Content Accessibility and Guidelines (WCAG) 2.0', '5', '3-4', '1-2', '0'),
 ('Prototype: Usability', '8-10', '5-7', '2-4', '0-1'),
]
t = d.add_table(rows=1, cols=7); t.style = 'Table Grid'
for c, h in zip(t.rows[0].cells, ['Criteria', 'Excellent', 'Good', 'Developing', 'Poor', 'Mark', 'Feedback']):
    c.paragraphs[0].add_run(h).bold = True
for row in rows:
    cells = t.add_row().cells
    for c, v in zip(cells, list(row) + ['', '']):
        c.text = v
tot = t.add_row().cells; tot[0].paragraphs[0].add_run('TOTAL').bold = True; tot[5].text = '/100'
for row in t.rows:
    for c, w in zip(row.cells, [8.5, 2, 2, 2.2, 2, 2, 8]):
        c.width = Cm(w)
d.add_paragraph()
d.add_paragraph('Referencing rubric: consistency and congruency of Harvard referencing (deduction of 5% or 10% for minor or major errors).')
d.save(OUT); print('saved')
