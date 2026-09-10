# Roster — Clash of Clans clan &amp; player lookup

A React + Tailwind site for looking up Clash of Clans clans and players by tag — no
account or login required. Search a clan tag to see its roster, war record and points
(similar to what Clash Ninja shows on a clan page); search a player tag to see town
hall, heroes, troops, spells and achievement progress.

## Why there's a `server/` folder

The official Clash of Clans API (`developer.clashofclans.com`) has two properties that
make it impossible to call straight from a browser:

1. **No CORS headers** — the browser blocks the response even if the request succeeds.
2. **IP-whitelisted keys** — each API key is tied to one (or a few) fixed IP addresses,
   which a visitor's browser doesn't have.

So this project ships a tiny Express proxy (`/server`) that holds your API key and
whitelisted IP server-side, and the React app (`/src`) only ever talks to that proxy.
This is the same shape real tools like Clash Ninja use under the hood.

## 1. Get a Clash of Clans API key

1. Create an account at https://developer.clashofclans.com
2. Run the proxy once (step 2 below) so you know its outbound IP, or check your
   hosting provider's static IP.
3. Create a key ("My Key" → Create Key) and whitelist that IP.
4. Copy the key.

## 2. Run the proxy

```bash
cd server
cp .env.example .env
# paste your key into COC_API_TOKEN in .env
npm install
npm start
```

The proxy listens on `http://localhost:5000` by default.

## 3. Run the frontend

```bash
cp .env.example .env.local   # defaults already point at the local proxy
npm install
npm run dev
```

Open the printed local URL. Search a clan tag (e.g. `#2PP`) or a player tag
(e.g. `#2PP0LYQ`) — the leading `#` is optional in the search box.

## Project structure

```
src/
  api/coc.js          fetch client for the proxy (normalizeTag, getClan, getPlayer, ...)
  components/          Navbar, SearchBar, ClanHeader, MemberTable, PlayerHeader, ...
  pages/                Home, ClanPage, PlayerPage (react-router routes)
  utils/format.js      number/role/league formatting helpers
server/
  index.js              Express proxy: /api/clans/:tag, /api/clans/:tag/members,
                        /api/clans/:tag/currentwar, /api/players/:tag
```

## Notes on data

- A clan's member list, war log and current war can be private in-game; the proxy
  passes the API's error straight through and the UI shows a plain "lookup failed"
  message rather than guessing why.
- Town hall level per member depends on the API returning `townHallLevel` on each
  clan-member record; the roster table quietly hides the town hall marker if it's
  missing rather than showing a broken icon.
- No game art assets are bundled (Supercell doesn't license them for third-party use);
  town hall and troop levels are shown as numbers with a color-coded marker instead.

## Extending it

Natural next additions, all just new proxy routes + pages:
- Current war detail page (`/api/clans/:tag/currentwar` is already proxied)
- Clan war league group (`/clans/:tag/currentwar/leaguegroup`)
- Player search by name isn't supported by the official API (it only supports lookup
  by exact tag) — that's why this app, like the API itself, is tag-based rather than
  a free-text player search.
