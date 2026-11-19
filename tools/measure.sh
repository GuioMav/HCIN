#!/bin/zsh
S=/private/tmp/claude-501/-Users-macbookair-Desktop-Hcin/f4f07156-0db1-419e-84cb-50e3e779f80b/scratchpad
osascript -e 'tell application "Microsoft Word" to close every document saving no' >/dev/null 2>&1
python3 build_report.py $S/draft.docx >/dev/null && ./word_finish.sh $S/draft.docx $S/draft_w.docx $S/draft.pdf && python3 -c "
import pypdf,re
r=pypdf.PdfReader('$S/draft.pdf')
for i,p in enumerate(r.pages):
    t=[x for x in p.extract_text().split('\n') if x.strip()]
    h=[x for x in t if re.match(r'^\d\. [A-Z]',x)]
    print(i+1, len(' '.join(t).split()), h[:1], '| last:', t[-1][:70])
"
