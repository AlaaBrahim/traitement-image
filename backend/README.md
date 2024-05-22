# FastAPI Project Setup Guide


## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setting Up a Virtual Environment](#setting-up-a-virtual-environment)
3. [Installing Project Requirements](#installing-project-requirements)
4. [Adding New Requirements](#adding-new-requirements)
5. [Running the FastAPI Server](#running-the-fastapi-server)

## Prerequisites

- Python 3.7 or later. Download and install it from [python.org](https://www.python.org/).
- Git. If you don't have Git, get it from [git-scm.com](https://git-scm.com/).

## Setting Up a Virtual Environment

To avoid conflicts with other Python projects and maintain a clean setup, we recommend creating a virtual environment:

1. Open a terminal or command prompt.
2. Navigate to the project's root directory:
   ```bash
   cd /path/to/your/project
   ```
3. Create a virtual environment named `env`:
   ```bash
   python -m venv env
   ```
4. Activate the virtual environment:
   - On Windows:
     ```bash
     env\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source env/bin/activate
     ```

## Installing Project Requirements

To install the necessary packages, follow these steps:

1. Ensure the virtual environment is activated (see above).
2. Install the requirements from `requirements.txt`:
   ```bash
   pip install -r requirements.txt
   ```

## Adding New Requirements

If you install new packages with `pip`, ensure they are added to `requirements.txt` so others can install them as well:

1. Install a new package:
   ```bash
   pip install <package-name>
   ```
2. Update `requirements.txt` to include the new package:
   ```bash
   pip freeze > requirements.txt
   ```

## Running the FastAPI Server

With the virtual environment activated and dependencies installed, you can run the FastAPI server using Uvicorn:

```bash
uvicorn main:app --reload
```

This starts the server in development mode with automatic reloading on code changes. By default, it runs on `http://localhost:8000`.
