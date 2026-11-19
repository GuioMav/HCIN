"""Word document helpers: Word citation fields, a Word source list, locked per-section bibliographies,
an automatic table of contents, SEQ figure captions, headers and footers."""
import re
import uuid
from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK, WD_LINE_SPACING
from docx.opc.packuri import PackURI
from docx.opc.part import Part
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Pt, Cm, RGBColor
from xml.sax.saxutils import escape

FONT = 'Arial'


# ---------------------------------------------------------------- sources
class Sources:
    def __init__(self, items):
        self.items = items  # tag -> dict

    def xml(self):
        out = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
               '<b:Sources SelectedStyle="\\HarvardAnglia2008OfficeOnline.xsl" StyleName="Harvard - Anglia" Version="2008" '
               'xmlns:b="http://schemas.openxmlformats.org/officeDocument/2006/bibliography" '
               'xmlns="http://schemas.openxmlformats.org/officeDocument/2006/bibliography">']
        for tag, s in self.items.items():
            out.append('<b:Source><b:Tag>%s</b:Tag><b:SourceType>%s</b:SourceType><b:Guid>{%s}</b:Guid>' % (
                tag, s['type'], str(uuid.uuid4()).upper()))
            if 'people' in s:
                out.append('<b:Author><b:Author><b:NameList>')
                for last, first in s['people']:
                    out.append('<b:Person><b:Last>%s</b:Last><b:First>%s</b:First></b:Person>' % (escape(last), escape(first)))
                out.append('</b:NameList></b:Author></b:Author>')
            else:
                out.append('<b:Author><b:Author><b:Corporate>%s</b:Corporate></b:Author></b:Author>' % escape(s['corporate']))
            for k in ('Title', 'Year', 'City', 'Publisher', 'Edition', 'URL', 'YearAccessed', 'MonthAccessed', 'DayAccessed', 'InternetSiteTitle'):
                if k in s:
                    out.append('<b:%s>%s</b:%s>' % (k, escape(str(s[k])), k))
            out.append('</b:Source>')
        out.append('</b:Sources>')
        return '\n'.join(out).encode('utf-8')

    def attach(self, doc):
        for rel in doc.part.rels.values():  # the default template already holds an empty source list
            if rel.reltype.endswith('/customXml') and b'bibliography' in rel.target_part.blob:
                rel.target_part._blob = self.xml()
                return
        guid = '{%s}' % str(uuid.uuid4()).upper()
        pkg = doc.part.package
        item = Part(PackURI('/customXml/item1.xml'), 'application/xml', self.xml(), pkg)
        props_xml = ('<?xml version="1.0" encoding="UTF-8" standalone="no"?>'
                     '<ds:datastoreItem ds:itemID="%s" xmlns:ds="http://schemas.openxmlformats.org/officeDocument/2006/customXml">'
                     '<ds:schemaRefs><ds:schemaRef ds:uri="http://schemas.openxmlformats.org/officeDocument/2006/bibliography"/>'
                     '</ds:schemaRefs></ds:datastoreItem>' % guid).encode('utf-8')
        props = Part(PackURI('/customXml/itemProps1.xml'),
                     'application/vnd.openxmlformats-officedocument.customXmlProperties+xml', props_xml, pkg)
        item.relate_to(props, 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/customXmlProps')
        doc.part.relate_to(item, 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/customXml')


# ---------------------------------------------------------------- low level runs / fields
def _run(p, text, bold=False, italic=False, size=None, color=None, underline=False):
    r = p.add_run(text)
    r.bold, r.italic, r.underline = bold, italic, underline
    if size:
        r.font.size = Pt(size)
    if color:
        r.font.color.rgb = RGBColor.from_string(color)
    return r


def _fld(p, kind, attrs=None):
    r = OxmlElement('w:r')
    fc = OxmlElement('w:fldChar')
    fc.set(qn('w:fldCharType'), kind)
    for k, v in (attrs or {}).items():
        fc.set(qn(k), v)
    r.append(fc)
    p._p.append(r)


def _instr(p, text):
    r = OxmlElement('w:r')
    t = OxmlElement('w:instrText')
    t.set(qn('xml:space'), 'preserve')
    t.text = text
    r.append(t)
    p._p.append(r)


def field(p, instr, result, lock=False, **fmt):
    _fld(p, 'begin', {'w:fldLock': '1'} if lock else None)
    _instr(p, ' %s ' % instr)
    _fld(p, 'separate')
    _run(p, result, **fmt)
    _fld(p, 'end')


def citation(p, tag, cached, suppress_author=False):
    """Inserts a real Word citation (content control + CITATION field)."""
    sdt = OxmlElement('w:sdt')
    pr = OxmlElement('w:sdtPr')
    i = OxmlElement('w:id')
    i.set(qn('w:val'), str(uuid.uuid4().int % 2000000000))
    pr.append(i)
    pr.append(OxmlElement('w:citation'))
    sdt.append(pr)
    content = OxmlElement('w:sdtContent')
    sdt.append(content)
    p._p.append(sdt)

    class Holder:  # lets field() append runs into the content control
        _p = content

        @staticmethod
        def add_run(text):
            r = OxmlElement('w:r')
            t = OxmlElement('w:t')
            t.set(qn('xml:space'), 'preserve')
            t.text = text
            r.append(t)
            content.append(r)
            from docx.text.run import Run
            return Run(r, p)

    field(Holder, 'CITATION %s%s \\l 7177' % (tag, ' \\n' if suppress_author else ''), cached)


# ---------------------------------------------------------------- document
class Report:
    def __init__(self, sources, header_text, footer_text):
        self.doc = Document()
        self.sources = sources
        self.fig = 0
        self.tab = 0
        self._styles()
        sec = self.doc.sections[0]
        sec.page_height, sec.page_width = Cm(29.7), Cm(21.0)
        sec.left_margin = sec.right_margin = Cm(2.0)
        sec.top_margin = sec.bottom_margin = Cm(2.0)
        sec.header_distance = sec.footer_distance = Cm(1.25)
        sec.different_first_page_header_footer = True
        self.header_text, self.footer_text = header_text, footer_text
        hp = sec.header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        _run(hp, header_text, size=9, color='555555')
        self._bottom_border(hp)

    def start_body(self):
        """New section for the report body: page numbers restart at 1 and count only body pages."""
        sec = self.doc.add_section(WD_SECTION.NEW_PAGE)
        sec.different_first_page_header_footer = False
        sec.header.is_linked_to_previous = False
        sec.footer.is_linked_to_previous = False
        pg = OxmlElement('w:pgNumType')
        pg.set(qn('w:start'), '1')
        sec._sectPr.append(pg)
        self._header_footer(sec, self.header_text, self.footer_text)

    # styles
    def _styles(self):
        st = self.doc.styles
        n = st['Normal']
        n.font.name = FONT
        n.font.size = Pt(11)
        n.element.rPr.rFonts.set(qn('w:eastAsia'), FONT)
        pf = n.paragraph_format
        pf.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        pf.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
        pf.line_spacing = 1.15
        pf.space_after = Pt(6)
        pf.space_before = Pt(0)
        for name, size, before, after in (('Heading 1', 15, 0, 8), ('Heading 2', 12, 8, 3), ('Title', 24, 0, 6)):
            s = st[name]
            s.font.name = FONT
            s.font.size = Pt(size)
            s.font.bold = True
            s.font.italic = False
            s.font.color.rgb = RGBColor(0, 0, 0)
            rpr = s.element.get_or_add_rPr()
            rf = rpr.find(qn('w:rFonts'))
            if rf is None:
                rf = OxmlElement('w:rFonts')
                rpr.append(rf)
            for a in ('w:ascii', 'w:hAnsi', 'w:eastAsia', 'w:cs'):
                rf.set(qn(a), FONT)
            for a in ('w:asciiTheme', 'w:hAnsiTheme', 'w:eastAsiaTheme', 'w:cstheme'):
                if rf.get(qn(a)) is not None:
                    del rf.attrib[qn(a)]
            s.paragraph_format.space_before = Pt(before)
            s.paragraph_format.space_after = Pt(after)
            s.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT
            s.paragraph_format.keep_with_next = True
            s.paragraph_format.line_spacing = 1.15
        st['Heading 1'].font.underline = True
        cap = st['Caption']
        cap.font.name = FONT
        cap.font.size = Pt(9.5)
        cap.font.bold = True
        cap.font.italic = False
        cap.font.color.rgb = RGBColor(0, 0, 0)
        cap.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
        cap.paragraph_format.space_after = Pt(3)
        cap.paragraph_format.keep_with_next = True
        bib = st['Bibliography'] if 'Bibliography' in [s.name for s in st] else st.add_style('Bibliography', 1)
        bib.base_style = n
        bib.paragraph_format.left_indent = Cm(1)
        bib.paragraph_format.first_line_indent = Cm(-1)
        bib.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT
        bib.paragraph_format.space_after = Pt(4)
        for name in ('toc 1', 'toc 2'):
            try:
                s = st[name]
            except KeyError:
                s = st.add_style(name, 1)
                s.element.set(qn('w:styleId'), name.upper().replace(' ', ''))  # Word's built-in ids: TOC1, TOC2
                s.element.remove(s.element.find(qn('w:name')))
                nm = OxmlElement('w:name')
                nm.set(qn('w:val'), name)
                s.element.insert(0, nm)
                if s.element.get(qn('w:customStyle')) is not None:
                    del s.element.attrib[qn('w:customStyle')]
            s.base_style = n
            s.font.name = FONT
            s.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT
            s.paragraph_format.space_after = Pt(3)
            s.paragraph_format.space_after = Pt(0)
            s.paragraph_format.line_spacing = 1.0
            if name == 'toc 1':
                s.font.bold = True
                s.font.size = Pt(10.5)
                s.paragraph_format.space_before = Pt(3)
            else:
                s.font.size = Pt(9.5)
                s.paragraph_format.left_indent = Cm(0.6)

    def _header_footer(self, sec, header_text, footer_text):
        hp = sec.header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        _run(hp, header_text, size=9, color='555555')
        self._bottom_border(hp)
        fp = sec.footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.LEFT
        tabs = fp.paragraph_format.tab_stops
        from docx.enum.text import WD_TAB_ALIGNMENT
        from docx.shared import Inches
        tabs.add_tab_stop(Inches(3.25), WD_TAB_ALIGNMENT.CLEAR)
        tabs.add_tab_stop(Inches(6.5), WD_TAB_ALIGNMENT.CLEAR)
        tabs.add_tab_stop(Cm(17.0), WD_TAB_ALIGNMENT.RIGHT)
        _run(fp, footer_text + '\t', size=9, color='555555')
        _run(fp, 'Page ', size=9, color='555555')
        field(fp, 'PAGE', '1', size=9, color='555555')
        _run(fp, ' of ', size=9, color='555555')
        field(fp, 'SECTIONPAGES', '1', size=9, color='555555')

    @staticmethod
    def _bottom_border(p):
        ppr = p._p.get_or_add_pPr()
        b = OxmlElement('w:pBdr')
        e = OxmlElement('w:bottom')
        for k, v in (('w:val', 'single'), ('w:sz', '4'), ('w:space', '4'), ('w:color', '999999')):
            e.set(qn(k), v)
        b.append(e)
        ppr.append(b)

    # content
    def cover(self, lines, title, subtitle):
        d = self.doc
        for _ in range(5):
            d.add_paragraph()
        p = d.add_paragraph(style='Title')
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        _run(p, title)
        p = d.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        _run(p, subtitle, size=14)
        for _ in range(4):
            d.add_paragraph()
        t = d.add_table(rows=0, cols=2)
        t.style = 'Table Grid'
        for k, v in lines:
            row = t.add_row().cells
            row[0].width, row[1].width = Cm(5), Cm(9)
            p0 = row[0].paragraphs[0]
            p0.alignment = WD_ALIGN_PARAGRAPH.LEFT
            _run(p0, k, bold=True)
            p1 = row[1].paragraphs[0]
            p1.alignment = WD_ALIGN_PARAGRAPH.LEFT
            _run(p1, v)
        t.alignment = 1
        self.page_break()

    def toc(self):
        p = self.doc.add_paragraph()
        _run(p, 'Table of Contents', bold=True, size=15, underline=True)
        p = self.doc.add_paragraph()
        field(p, 'TOC \\o "1-2" \\h \\z \\u', 'Right-click and choose Update Field to build the table of contents.')
        self.start_body()

    def page_break(self):
        p = self.doc.add_paragraph()
        p.paragraph_format.space_after = Pt(0)
        p.add_run().add_break(WD_BREAK.PAGE)

    def h1(self, text, new_page=True):
        if new_page and self._used:
            # page break before the heading keeps each section on a new page
            pass
        p = self.doc.add_heading(text, level=1)
        if new_page:
            p.paragraph_format.page_break_before = True
        return p

    _used = False

    def h2(self, text):
        return self.doc.add_heading(text, level=2)

    def para(self, text, style=None, align=None, space_after=None, keep=False):
        p = self.doc.add_paragraph(style=style)
        if align is not None:
            p.alignment = align
        if space_after is not None:
            p.paragraph_format.space_after = Pt(space_after)
        if keep:
            p.paragraph_format.keep_with_next = True
        self.rich(p, text)
        return p

    TOKEN = re.compile(r'(\{[cn]:[A-Za-z0-9]+\}|\*\*[^*]+\*\*|__[^_]+__)')

    def rich(self, p, text):
        for part in self.TOKEN.split(text):
            if not part:
                continue
            if part.startswith('{c:'):
                tag = part[3:-1]
                citation(p, tag, '(%s, %s)' % (self.sources.items[tag]['cite'], self.sources.items[tag]['Year']))
            elif part.startswith('{n:'):
                tag = part[3:-1]
                _run(p, self.sources.items[tag]['cite'] + ' ')
                citation(p, tag, '(%s)' % self.sources.items[tag]['Year'], suppress_author=True)
            elif part.startswith('**'):
                _run(p, part[2:-2], bold=True)
            elif part.startswith('__'):
                _run(p, part[2:-2], italic=True)
            else:
                _run(p, part)

    def figure(self, path, width_cm, caption, howto):
        p = self.doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.keep_with_next = True
        p.paragraph_format.space_before = Pt(6)
        p.paragraph_format.space_after = Pt(2)
        p.add_run().add_picture(path, width=Cm(width_cm))
        self.fig += 1
        c = self.doc.add_paragraph(style='Caption')
        _run(c, 'Figure ')
        field(c, 'SEQ Figure \\* ARABIC', str(self.fig))
        _run(c, ': ' + caption)
        h = self.doc.add_paragraph()
        h.paragraph_format.space_after = Pt(10)
        h.paragraph_format.left_indent = Cm(0.4)
        h.paragraph_format.right_indent = Cm(0.4)
        shade = OxmlElement('w:shd')
        shade.set(qn('w:val'), 'clear')
        shade.set(qn('w:color'), 'auto')
        shade.set(qn('w:fill'), 'F2F5FB')
        h._p.get_or_add_pPr().append(shade)
        _run(h, 'Using this screen: ', bold=True, size=10)
        for part in self.TOKEN.split(howto):
            if part.startswith('**'):
                _run(h, part[2:-2], bold=True, size=10)
            elif part:
                _run(h, part, size=10)
        return self.fig

    def table(self, header, rows, widths, caption=None):
        if caption:
            self.tab += 1
            c = self.doc.add_paragraph(style='Caption')
            _run(c, 'Table ')
            field(c, 'SEQ Table \\* ARABIC', str(self.tab))
            _run(c, ': ' + caption)
        t = self.doc.add_table(rows=1, cols=len(header))
        t.style = 'Table Grid'
        for i, h in enumerate(header):
            cell = t.rows[0].cells[i]
            cell.width = Cm(widths[i])
            pp = cell.paragraphs[0]
            pp.alignment = WD_ALIGN_PARAGRAPH.LEFT
            _run(pp, h, bold=True, size=10)
            sh = OxmlElement('w:shd')
            sh.set(qn('w:val'), 'clear')
            sh.set(qn('w:fill'), 'E7ECF5')
            cell._tc.get_or_add_tcPr().append(sh)
        for row in rows:
            cells = t.add_row().cells
            for i, v in enumerate(row):
                cells[i].width = Cm(widths[i])
                pp = cells[i].paragraphs[0]
                pp.alignment = WD_ALIGN_PARAGRAPH.LEFT
                pp.paragraph_format.space_after = Pt(2)
                pp.paragraph_format.line_spacing = 1.0
                for part in self.TOKEN.split(v):
                    if part.startswith('**'):
                        _run(pp, part[2:-2], bold=True, size=10)
                    elif part:
                        _run(pp, part, size=10)
        # repeat header row
        trpr = t.rows[0]._tr.get_or_add_trPr()
        th = OxmlElement('w:tblHeader')
        trpr.append(th)
        sp = self.doc.add_paragraph()
        sp.paragraph_format.space_after = Pt(2)
        return t

    def references(self, tags):
        """Section reference list: a locked Word BIBLIOGRAPHY field holding only this section's sources."""
        p = self.doc.add_paragraph()
        p.paragraph_format.space_before = Pt(6)
        p.paragraph_format.keep_with_next = True
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        _run(p, 'References', bold=True, size=12)
        entries = sorted(tags, key=lambda t: self.sources.items[t]['sort'])
        paras = [self.doc.add_paragraph(style='Bibliography') for _ in entries]
        _fld(paras[0], 'begin', {'w:fldLock': '1'})
        _instr(paras[0], ' BIBLIOGRAPHY \\l 7177 ')
        _fld(paras[0], 'separate')
        for p, tag in zip(paras, entries):
            for text, ital in self.sources.items[tag]['ref']:
                _run(p, text, italic=ital)
        _fld(paras[-1], 'end')

    def save(self, path):
        self.sources.attach(self.doc)
        self.doc.save(path)
