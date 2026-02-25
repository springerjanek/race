# 🏁 Real-Time Type Racer

## 🛠 Tech Stack

### Frontend - Complex logic done with the help of AI.
- Next.js (App Router)
- React
- TypeScript
- Socket.io Client

### Backend - mostly done with the help of AI on purpose.
- NestJS
- Socket.io (WebSockets)
- TypeORM
- PostgreSQL (Render)

---

Frontend code at `fe` branch, Backend code at `main` branch

##  things to fix / to do I've notices during coding

### Scoreboard
- Needs to properly fetch user statistics from the backend.
- Should persist race results and aggregate long-term metrics.

###  Progress Between Rounds

###  WPM Calculation + random sentences list

### Authentication Improvements
- Currently uses `localStorage` for session persistence.
- In a real-world production scenario:
  - JWT + HttpOnly cookies would be implemented.
  - Proper refresh token handling would be added.
- Loading states should be added to prevent multiple `/login` requests from being triggered rapidly.

### Scoreboard page 
- Fetching users from backend
- add filtering logic/pagination

###  FAQ Page
- Was thinking about adding faq page with scoring logic so users know how theyre getting total points

### Deprecated Form Types `React.FormEvent<HTMLFormElement>`

### Testing

---

Thanks for the opportunity. Due to time shortage I've decided to focus on shipping atleast something (Good amount of AI usage). I'd love to show my thinking process, notes/sketches and changes I'd implement.
I'm sure with more time I could implement the whole app, before starting the process I've had some designs in my notebook and logic on how the typing system would work. 
I'm not satisfied with the outcome, have a great day to whoever is reviewing this!!
