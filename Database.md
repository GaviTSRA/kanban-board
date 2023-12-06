PostgreSQL   

- Tables
    - `boards`
        ```sql
        CREATE TABLE boards (
            id string NOT NULL UNIQUE,
            title text NOT NULL,
            description text
        )
        ```
    - `lists`
        ```sql
        CREATE TABLE lists (
            id string NOT NULL UNIQUE,
            board string NOT NULL,
            title text NOT NULL,
            position number NOT NULL
        )
        ```
    - `cards`
        ```sql
        CREATE TABLE cards (
            id string NOT NULL UNIQUE,
            list string NOT NULL,
            board string NOT NULL,
            title text NOT NULL,
            description text,
            position number NOT NULL
        )
        ```
        