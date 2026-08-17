# Polish Party Floor

Build a browser-based Polish party game inspired by the general concept of the TV show The Floor.

This is a local, single-screen party game that will be played on a laptop connected to a projector.

IMPORTANT:

- This is NOT an online multiplayer game.

- There is no authentication.

- There is no backend.

- There is no database.

- There are no accounts.

- Everything should work locally in the browser.

- Use React and TypeScript.

- Keep the architecture simple.

- Do not over-engineer.

- Do not invent additional game mechanics.

- The application language must be Polish.

For this first step, build the basic application architecture and navigation only.

Create these main sections/screens:

1. GAME SETUP

2. GAME SCREEN

3. DUEL RESULT

4. FINAL WINNER

The game setup should allow the host to enter:

- number of players

- player names

- categories

For now, create the basic UI and data structures for these things.

A player is simply a player. Players do NOT own categories.

Categories belong to a shared category pool.

Each category will eventually contain:

- category name

- one hint

- an ordered list of photo questions

- a correct answer for every photo

The game will eventually track:

- all players

- surviving players

- categories

- questions

- consumed questions for the current game

- current duel

- active player

- timers

- game phase

Do not implement the complete game mechanics yet.

First create a clean, maintainable foundation that we can extend in subsequent prompts.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ae727334-c551-437d-9ef3-10e2224fb1e6).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
