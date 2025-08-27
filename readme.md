# Slack Standup Bot

A Slack app built with Deno that provides shortcuts for managing daily standups.

## Available Shortcuts

After installation, you'll have these shortcuts available:

- **Standup** - Displays all users in the channel in random order (excluding
  those on the exclude list)
- **Exclude from Standup** - Opens a modal to select a user to exclude from
  standup lists
- **Include in Standup** - Opens a modal to select a user to include back in
  standup lists

To use shortcuts in Slack:

1. Type `/` in any channel and search for the shortcut name, OR
2. Click the shortcuts button (lightning bolt ⚡) in the message composer

## Prerequisites

1. Install Deno: https://deno.land/manual/getting_started/installation
2. Install the Slack CLI and create a symlink in ~/.local/bin:

```bash
# Install Slack CLI
curl -fsSL https://downloads.slack-edge.com/slack-cli/install.sh | bash -s slack-cli

# Create symlink with a custom name to avoid conflict with Slack desktop app
mkdir -p ~/.local/bin
ln -sf ~/.slack/bin/slack ~/.local/bin/slack-cli
```

Make sure ~/.local/bin is in your PATH (add to ~/.bashrc or ~/.zshrc if needed):

```bash
export PATH="$HOME/.local/bin:$PATH"
```

## Installation

1. Clone this repository and navigate to the project directory

2. Login to Slack:

```bash
slack-cli login
```

3. Deploy and create all triggers with one command:

```bash
deno task setup
```

Or run the steps separately:

```bash
# Deploy the app
deno task deploy

# Create all triggers
deno task create-triggers
```

The Slack CLI will handle all authentication and configuration automatically -
no `.env` files or manual token management needed!

## Development

Run the app in local development mode:

```bash
slack-cli run
```

This will start a local development server and create a connection to your Slack
workspace.

## How it Works

- The app uses Slack's datastore to persist excluded users per channel
- Each slash command triggers a workflow that executes the corresponding
  function
- User lists are randomized on each `/standup` command
- All usernames are displayed with `@` prefix as requested

## Project Structure

```
├── datastores/       # Datastore definitions (excluded users)
├── functions/        # Core logic for each command
├── workflows/        # Workflow definitions that orchestrate functions
├── triggers/         # Slash command trigger definitions
├── manifest.ts       # App manifest with permissions
├── slack.json        # Slack CLI configuration
└── deno.json        # Deno configuration
```
