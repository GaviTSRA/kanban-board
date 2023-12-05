- Typescript 
- express 
- express-ws
- sequelize

---

- GET  `/`  
    _List all boards_  
    Returns: list of [id: string, name: string, description: string]

- POST `/`  
    _Create new board_   
    Params: title, description   
    Returns: 200

- DELETE `/`    
    _Delete a board_
    Params: id
    Returns: 400, 404, 200

- WS `/board/[board-id]`  
    _Open a websocket to get data of the board and update it_   
    - After connection: WS sends board data as json   
    - Client options: object with `action: string` and data as json   
      Respones for updates: `{"success": true}` or `{"success": false, "error": ...}`
        - `updateBoard`   
            - `id: string`
            - `title?: string`
            - `description?: string`
        - `updateList`
            - `id?: string`
            - `title?: string`
            - `position?: number`
        - `updateCard`
            - `id?: string`
            - `title?: string`
            - `description?: string`
            - `position?: number`
    - WS options: `{"type": ..., ...}` and data as json
        - `board`
            - `id: string`
            - `title: string`
            - `description: string`
            - `lists: string[]`
        - `list`
            - `id: string`
            - `board: string` 
            - `title: string`
            - `cards: string[]`
        - `card`
            - `id: string`
            - `list: string`
            - `title: string`
            - `description: string`
