# Hackathons Data

This directory contains JSON files for each hackathon displayed on the website.

## File Structure

- `index.json`: Lists all the hackathon IDs that should be loaded by the application.
- `[hackathon-id].json`: Individual hackathon data files (e.g., `iyd-2025.json`, `nyd-2025.json`).

## Adding a New Hackathon

1. Create a new JSON file in this directory with the hackathon ID as the filename (e.g., `new-hackathon-2026.json`).
2. Follow the existing schema for consistency.
3. Add the new hackathon ID to the `index.json` file.

## Hackathon JSON Schema

Each hackathon file must follow this structure:

```json
{
  "id": "unique-hackathon-id",
  "title": "Hackathon Title",
  "subtitle": "Hackathon Subtitle",
  "prizes": [
    { "position": "1st Prize", "amount": "INR 20k", "color": "#ffd700" },
    { "position": "2nd Prize", "amount": "INR 10k", "color": "#c0c0c0" }
  ],
  "tasks": [
    { "description": "Task description" },
    { 
      "description": "Task with subtasks",
      "subTasks": ["Subtask 1", "Subtask 2"]
    }
  ],
  "rules": [
    { "rule": "Rule 1" },
    { "rule": "Rule 2", "isHighlighted": true }
  ],
  "dates": [
    { "event": "Registration", "date": "January 1, 2026" },
    { "event": "Final Submission", "date": "February 1, 2026", "isHighlighted": true, "link": "optional-link" }
  ],
  "sponsors": [
    {
      "name": "Sponsor Name",
      "title": "Sponsor Title",
      "link": "https://example.com/sponsor-image.jpg"
    }
  ],
  "contactEmail": "contact@example.com",
  "isCompleted": false,
  "winners": [
    {
      "position": "#1 Prize",
      "names": ["Person 1", "Person 2"],
      "institute": "Institute Name",
      "image": "https://example.com/winners-image.jpg"
    }
  ]
}
```

The `winners` field is only required for completed hackathons (`isCompleted: true`). 