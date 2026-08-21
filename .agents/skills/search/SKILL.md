---
name: search
description: Search for given words or phrases in one or multiple bibles, across all books or filtered by a specific book (e.g. Genesis, 1Cor, John). Wildcards (*, ?) and logical combinations (+, |) supported.
---

# Bible Search Skill

## Overview
This standalone skill enables any agent to search for words or phrases inside local SQLite Bible databases stored in `~/biblemate/data/bibles` or `~/biblemate/data_custom/bibles`.

## Guidelines & Objectives
When executing this skill:
- Always run the python retriever script located at `.agents/skills/search/search_retriever.py` to perform the search.
- For full Bible search: `python3 .agents/skills/search/search_retriever.py "<query>"`
- For single book search: `python3 .agents/skills/search/search_retriever.py --book <BookCode/Name> "<query>"` (e.g., `--book Gen`, `--book 1Cor`, `--book John`).
- Pass the user's version and search query exactly as given to the script.
- Present the exact output of the script to the user without summarizing, paraphrasing, or altering the text, maintaining the absolute authority and accuracy of God's Word.
