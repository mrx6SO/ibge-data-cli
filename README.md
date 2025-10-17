![npm version](https://img.shields.io/npm/v/@rmderojr/ibge-data-cli)
![downloads](https://img.shields.io/npm/dw/@rmderojr/ibge-data-cli)
![license](https://img.shields.io/npm/l/@rmderojr/ibge-data-cli)

# IBGE Data CLI

`ibge-data-cli` is a command-line interface (CLI) tool to fetch, store, and query Brazilian location data (states and cities) from the official IBGE API.

This tool is perfect for developers, data analysts, and students who need quick and offline access to this public data.

## Features

- **One-Command Sync**: Fetch all states and cities from the IBGE API and store them in a local SQLite database.
- **Offline Queries**: List all cities for a specific state directly from your terminal, without needing an internet connection after the initial sync.
- **Data Export**: Export the entire dataset of states and cities to a single CSV file for use in other applications or analysis.
- **Local Cache**: API requests are cached to avoid unnecessary calls and respect rate limits.

## Installation

You can install the CLI globally via npm to use it anywhere on your system.

```bash
npm install -g @rmderojr/ibge-data-cli
```

## Usage

### 1. Import Data
First, you need to sync the data from the IBGE API to your local database. This command creates the database and populates it.

```bash
ibge-data-cli import-data
```

### 2. List Cities by State
Once the data is imported, you can list all cities for a given state using its two-letter abbreviation (UF).

```bash
ibge-data-cli list-cities <UF>
```

**Example:**
```bash
ibge-data-cli list-cities SP
```

### 3. Export to CSV
Export all states and their corresponding cities to a CSV file.

```bash
ibge-data-cli export-csv <filename.csv>
```

**Example:**
```bash
ibge-data-cli export-csv brazil-locations.csv
```

## Development

If you want to contribute to the project, follow these steps:

1.  **Clone the repository:** `git clone https://github.com/mrx6SO/ibge-data-cli.git`
2.  **Install dependencies:** `npm install`
3.  **Run migrations:** `npm run knex:migrate`
4.  **Run commands locally:** `node src/app.js <command>`
