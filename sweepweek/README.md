# SweepWeek

Putzplan-Web-App fuer einen 2-Personen-Haushalt. Next.js (App Router) + TypeScript,
SQLite ueber Drizzle ORM, Server Components/Server Actions ohne separate API-Schicht.

## Home Assistant Add-on

SweepWeek ist als Home-Assistant-Add-on fuer HAOS/Supervised ausgelegt. Die App wird
ueber Home-Assistant-Ingress in der Sidebar geoeffnet und veroeffentlicht keinen
separaten Port nach aussen.

Die Datenbank liegt im von Supervisor verwalteten Add-on-Datenverzeichnis (`/data`
im Container) und wird von HA-Backups mit erfasst. Bei Schema- oder Code-Aenderungen
`version` in `config.yaml` erhoehen, damit Supervisor ein Update anbietet.

### Zurueck-Button

Ueber den "Configuration"-Tab des Add-ons laesst sich oben im Header ein Zurueck-Button
einblenden (z.B. wenn die App per Dashboard-Button geoeffnet wird und man dahin
zurueckspringen moechte):

- `back_button`: Button ein-/ausblenden (Standard: aus).
- `back_button_path`: optionales Navigationsziel (z.B. `/lovelace-dashboard/0`). Leer
  gelassen geht der Button einfach "zurueck" (Browser-Verlauf des uebergeordneten
  HA-Fensters, faellt bei Zugriffsproblemen auf den eigenen Verlauf zurueck).

Ist ein Ziel gesetzt, wird zusaetzlich versucht, das Ziel per `browser_mod`-Service
anzuspringen (falls diese Community-Integration installiert ist) - das ist
zuverlaessiger als eine direkte Navigation des uebergeordneten Fensters, falls HA das
per Sandbox einschraenkt. Aenderungen an diesen Optionen erfordern einen Neustart des
Add-ons.

## Entwicklung

```bash
npm install
cp .env.example .env       # DATABASE_PATH
npm run db:migrate         # nur fuer einen bewussten manuellen Lauf noetig -
                            # Migrationen laufen beim Serverstart ohnehin automatisch
npm run dev
```

App laeuft lokal unter [http://localhost:3000](http://localhost:3000), Start-Redirect
auf `/aufgaben`.

## Datenbank-Schema Aendern

```bash
# lib/db/schema.ts anpassen, dann:
npm run db:generate        # neue Migration erzeugen
```

Migrationen werden beim Start des Next.js-Servers automatisch angewendet
(`instrumentation.ts` -> `lib/db/migrate.ts`) - sowohl im Dev-Server als auch im
Docker-Container. `npm run db:migrate` ist nur fuer manuelles Anwenden ohne
Serverstart gedacht, z.B. in CI.

## Reverse-Proxy-Praefix / Home-Assistant-Ingress

Next.js kompiliert seinen `basePath` fest zur Build-Zeit ein - das passt nicht zu
Home-Assistant-Ingress, das pro Add-on-Installation einen dynamischen,
unvorhersehbaren Token-Pfad vergibt (`/api/hassio_ingress/<token>/...`).

Deshalb wird die App immer mit einem festen Platzhalter-Praefix gebaut
(`/__sweepweek_base__`, siehe `server/constants.mjs`). Ein kleiner Proxy
(`server/ingress-proxy.mjs`) laeuft im Container vor dem eigentlichen Next.js-Server
(intern auf Port 3001) und ersetzt bei jeder Antwort diesen Platzhalter durch den
tatsaechlichen Praefix:

- Bei HA-Ingress liest der Proxy den `X-Ingress-Path`-Header pro Request aus.
- Sonst greift `EXTERNAL_BASE_PATH` als fester Praefix fuer generische Reverse-Proxies.
- Ist beides leer, wird der Platzhalter durch einen leeren String ersetzt.

`npm run dev` baut ohne Platzhalter. Der Mechanismus greift nur im Production-Build
und im Docker-Container.

## Docker

```bash
docker build -t sweepweek .
docker run -d -p 3000:3000 -v sweepweek-data:/data sweepweek
```

Die SQLite-Datei liegt im Volume unter `/data/sweepweek.db`. Migrationen werden beim
Start automatisch angewendet. Fuer einen festen Reverse-Proxy-Praefix
`EXTERNAL_BASE_PATH` beim Start setzen: `docker run -e EXTERNAL_BASE_PATH=/mein-prefix ...`.

## Docker Compose

```bash
docker compose up -d --build
```

Baut das Image, startet den Container auf Port 3000 mit persistentem Volume
`sweepweek-data`.
