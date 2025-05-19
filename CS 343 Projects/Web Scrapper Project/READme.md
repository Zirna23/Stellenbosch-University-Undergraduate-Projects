StackOverflow API Scraper

Project Overview

This project implements a REST API that recreates functionality from the StackExchange API specification, focusing on StackOverflow data. It uses Python and Flask to build the API, with data scraped from the StackOverflow website using BeautifulSoup.

Features

- Implements 4 endpoints: /collectives, /questions, /questions/{ids}, and /answers/{ids}
- Supports pagesize and page filters described in the StackExchange API specification

Requirements

- Python 3.x
- Flask
- BeautifulSoup4
- Requests

API Endpoints

- /collectives: Returns a list of Collective objects
- /questions: Returns a list of Question objects
- /questions/{ids}: Returns a list of Question objects identified by IDs
- /answers/{ids}: Returns a list of Answer objects identified by IDs
- /questions/{ids}/answers: Returns a list of Answer objects for given question IDs

