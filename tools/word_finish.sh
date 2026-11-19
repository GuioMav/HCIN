#!/bin/zsh
# usage: word_finish.sh in.docx out.docx out.pdf  -> updates only the TOC field in Word, saves pdf and docx, prints page count
rm -f "$2" "$3"
osascript <<OSA
tell application "Microsoft Word"
  set d to open file name "$1"
  set k to 0
  repeat with f in (get fields of d)
    if (field type of f) is field TOC then
      update field f
      set k to k + 1
    end if
  end repeat
  set n to (get compute statistics d statistic statistic pages)
  save as d file name "$3" file format format PDF
  save as d file name "$2" file format format document
  close every document saving no
  return (k as string) & " toc, pages " & (n as string)
end tell
OSA
