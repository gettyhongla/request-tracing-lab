# Google Sheets Workbook Setup

This project includes an Apps Script generator:

```text
create_troubleshooting_workbook.gs
```

Running it creates a new Google Spreadsheet named:

```text
Production Operations Deep Study Workbook
```

The workbook is a deep-study tracker for production operations, layered troubleshooting, PostgreSQL behavior, Redis boundaries, database resilience, and Kubernetes symptom comparison.

## 1. Open Google Apps Script

Go to:

```text
https://script.google.com/
```

Sign in with the Google account where you want the workbook created.

## 2. Create A New Script Project

Click:

```text
New project
```

Rename the script project if you want, for example:

```text
Production Operations Workbook Builder
```

## 3. Paste The Script

Open `create_troubleshooting_workbook.gs` from this repository.

Copy the full file contents and paste them into the Apps Script editor, replacing the starter `Code.gs` content.

## 4. Run The Script

In the Apps Script toolbar:

1. Select the function:

```text
createTroubleshootingWorkbook
```

2. Click **Run**.

The first run may take a little longer because Google asks for authorization.

## 5. Approve Permissions

Google will ask for permission to create and modify spreadsheets in your Drive.

That permission is required because the script:

```text
creates a new spreadsheet
creates tabs
writes study content
formats rows and columns
adds dropdowns
adds conditional formatting
```

The script does not need to read private spreadsheets or modify an existing spreadsheet. It creates a new workbook.

## 6. Find The Created Spreadsheet

After the script finishes:

1. Open **Executions** or **Logs** in Apps Script.
2. Look for a line like:

```text
Created spreadsheet: https://docs.google.com/spreadsheets/d/...
```

3. Open that URL.

You can also find the file in Google Drive by searching for:

```text
Production Operations Deep Study Workbook
```

## 7. Rerun Or Reset

Each run creates a brand-new spreadsheet.

If you want a clean reset:

```text
Run createTroubleshootingWorkbook again.
Use the new spreadsheet.
Delete or archive the older copy if you no longer need it.
```

The script does not overwrite existing spreadsheets.

## 8. Modify The Workbook Later

To change the workbook content:

1. Edit the rows inside the related builder function.
2. Run the script again.
3. Use the newly generated workbook.

Example:

```text
buildScenarioPractice()
```

controls the **Scenario Practice** tab.

```text
buildQuiz()
buildAnswerKey()
quizQuestions()
```

control the quiz and answer key.

```text
buildStudyTracker()
```

controls the tracker rows, dropdowns, and confidence-based conditional formatting.

## 9. Recommended Use

Start with these tabs:

```text
Start Here
Request Path
Layer Troubleshooting
Latency by Layer
Symptom Matrix
PostgreSQL Metrics
Connections & Pooling
Transactions & Locks
Slow Query Investigation
Indexing & EXPLAIN
```

Then use:

```text
Scenario Practice
Interview Questions
Quiz
Answer Key
Study Tracker
```

to turn the material into interview-ready recall.
