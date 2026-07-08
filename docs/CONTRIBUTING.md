# Contributing Guide

Welcome to the **TEAM-{{TEAM_ID}}** project! Please follow these guidelines to keep our workflow consistent and our Git history clean.

---

## 1. Before You Start

Always start with the latest version of the project.

```bash
git checkout main
git pull origin main
```

Then create a new branch for your assigned issue.

---

## 2. Branch Naming Convention

### Feature

```
feat/<issue-number>-<short-description>
```

Example:

```
feat/3-home-upcoming-events
feat/11-payment-upload-api
```

### Bug Fix

```
fix/<issue-number>-<short-description>
```

Example:

```
fix/14-sql-syntax
```

### Documentation / Task

```
docs/<issue-number>-<short-description>
```

Example:

```
docs/21-contributing
docs/19-pr-template
```

---

## 3. Commit Message Convention

Use meaningful commit messages.

### Feature

```
feat: short description
```

Example:

```
feat: implement upcoming events section
```

### Bug Fix

```
fix: short description
```

Example:

```
fix: resolve SQL syntax error
```

### Documentation

```
docs: short description
```

Example:

```
docs: add contributing guide
```

---

## 4. Pull Request Workflow

1. Push your branch.

```bash
git push -u origin <branch-name>
```

2. Create a Pull Request targeting `main`.

3. Fill in the Pull Request template.

4. Under **Related Issue**, replace:

```
Closes #
```

with the actual issue number.

Example:

```
Closes #21
```

This automatically links the Pull Request to the Issue and closes the Issue after merging.

5. Request at least one reviewer.

6. Address any review comments if needed.

---

## 5. Merge Strategy

We use **Squash and Merge** for all Pull Requests.

Benefits:

- Cleaner Git history
- One commit per completed issue
- Easier to track completed work

---

## 6. Development Setup

```bash
git checkout main
git pull origin main

cd app
bun install

cd app/packages/client
bun install

cd app/packages/server
bun install
```

Referece [Getting Started](./app/README.md)
Run the application according to the package you're working on.

---

## 7. General Guidelines

- Never commit directly to `main`.
- One issue = one branch = one Pull Request.
- Keep commits small and focused.
- Test your changes before creating a Pull Request.
- Link every Pull Request to its corresponding Issue.
- Review teammates' Pull Requests respectfully and constructively.
