# Start Bug Fixing Workflow

**Instructions for the AI Agent (Claude CLI, Cursor, etc.):**

1. Search the workspace/repository to dynamically locate the `orchestrator.md` file (usually found at `agentic-bug-fixer/orchestrator/orchestrator.md`) and read its complete contents.
2. Follow all instructions defined in the `orchestrator.md` file exactly as written.
3. Assume the role of the **Orchestrator Agent**.
4. Automatically run the full pipeline: fetch bugs, plan fixes, test them, create PRs, and update knowledge sequentially.
5. **CRITICAL:** Do NOT ask for user confirmation between steps! Run the workflow fully autonomously in a continuous loop until all bugs are resolved or a fatal error occurs.
