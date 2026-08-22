# AI Team Configuration

> [!IMPORTANT]
> **Universal Scripture Retrieval Rule**: Whenever you or any agent persona configured in this system need to quote, reference, or compare Bible verse content in a response, you **MUST** run the local `bible` skill (or `/bible` command) to retrieve the exact verse text from the local SQLite databases. Do not quote scripture passages from memory. This ensures absolute accuracy and consistency.

> [!IMPORTANT]
> **Universal Study Output Saving Rule (MANDATORY)**: Whenever you execute any bible-related skill/slash command (except biblemate, biblemate-super, image, data, sync, md, docx, and zip), you **MUST** save the complete final study output (such as outlines, sermons, devotionals, analyses, etc.) to a file in the `biblemate/` subdirectory.
> - The output file MUST be saved as a physical markdown file in the `biblemate/` directory using the `write_to_file` tool in the workspace.
> - Every output filename MUST be prefixed with a timestamp in the format `YYYY-MM-DD-HH-MM-SS_` followed by a short descriptive name ending in `.md` (e.g., `biblemate/2026-06-23-00-15-30_romans_8_devotion.md`).
> - Extract the current timestamp from the environment metadata, or run:
>   `python3 -c "import datetime; print(datetime.datetime.now().strftime('%Y-%m-%d-%H-%M-%S'))"`
>   first, and use that value as the prefix.
> - Do not write or save study output files to any directory outside the workspace `biblemate/` subdirectory.
> - Always confirm the exact path of the saved file to the user in your final chat response.

---

## Modular Subagent Personas

The individual subagent personas are maintained in modular files under `.agents/personas/`:

| Persona | Description | File |
| :--- | :--- | :--- |
| **Passionate Evangelist** | Preaching style, warmth, and salvation focus of Billy Graham | [.agents/personas/passionate-evangelist.md](.agents/personas/passionate-evangelist.md) |
| **Context Analyst David** | Historical context and David's life background in the Psalms | [.agents/personas/context-analyst-david.md](.agents/personas/context-analyst-david.md) |
| **Biblical Content Interpreter** | Interpreting contemporary topics through biblical worldview | [.agents/personas/biblical-content-interpreter.md](.agents/personas/biblical-content-interpreter.md) |
| **Compassionate Pastor** | Empathetic pastoral counsel and first-person prayers | [.agents/personas/compassionate-pastor.md](.agents/personas/compassionate-pastor.md) |
| **Verse Scripter** | Targeted scripture reference compilation and concordances | [.agents/personas/verse-scripter.md](.agents/personas/verse-scripter.md) |
| **OT Bible Scholar** | Rigorous Hebrew/ANE historical-grammatical exegesis | [.agents/personas/ot-bible-scholar.md](.agents/personas/ot-bible-scholar.md) |
| **NT Bible Scholar** | Koine Greek, Second Temple Judaism, and Pauline rhetoric | [.agents/personas/nt-bible-scholar.md](.agents/personas/nt-bible-scholar.md) |
| **Biblical Theologian** | Redemptive-historical progression, covenants, and typology | [.agents/personas/biblical-theologian.md](.agents/personas/biblical-theologian.md) |
| **Systematic Theologian** | Logical doctrinal loci synthesis and historic orthodoxy | [.agents/personas/systematic-theologian.md](.agents/personas/systematic-theologian.md) |
| **Biblical Translator** | Hebrew/Greek mapping and elevated biblical English translation | [.agents/personas/biblical-translator.md](.agents/personas/biblical-translator.md) |
| **Biblical Linguistic Analyst** | Original language grammar, morphology, and discourse syntax | [.agents/personas/biblical-linguistic-analyst.md](.agents/personas/biblical-linguistic-analyst.md) |
| **Bible Textual Critic** | Textual variants, translation comparisons, and manuscript history | [.agents/personas/bible-textual-critic.md](.agents/personas/bible-textual-critic.md) |
| **Master Biblical Writer** | Multi-pass iterative integration into publication-grade documents | [.agents/personas/master-biblical-writer.md](.agents/personas/master-biblical-writer.md) |
| **AI Agent Creator** | Meta-agent designer generating structured agent personas | [.agents/personas/ai-agent-creator.md](.agents/personas/ai-agent-creator.md) |
| **Study Quality Auditor** | Multi-phase study planning and quality assurance auditing | [.agents/personas/study-quality-auditor.md](.agents/personas/study-quality-auditor.md) |
