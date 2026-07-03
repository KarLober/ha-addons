# Home Assistant Add-ons

Sammlung von Home-Assistant-Add-ons. Dieses Repository kann in Home Assistant als
Add-on-Repository hinzugefuegt werden.

## Installation

1. Home Assistant oeffnen.
2. Zu **Einstellungen -> Add-ons -> Add-on Store** wechseln.
3. Oben rechts das Menue oeffnen und **Repositories** waehlen.
4. Die GitHub-URL dieses Repositories eintragen.
5. Repository neu laden und das gewuenschte Add-on installieren.

## Add-ons

- **SweepWeek** (`sweepweek/`): Putzplan-Web-App mit Home-Assistant-Ingress und
  persistenter SQLite-Datenbank im Add-on-Datenverzeichnis.

## Veroeffentlichung

Vor der oeffentlichen Veroeffentlichung `repository.yaml` anpassen:

```yaml
name: Home Assistant Add-ons
url: https://github.com/<github-user>/<repo>
maintainer: Your Name
```

Jedes weitere Add-on bekommt einen eigenen Unterordner mit mindestens
`config.yaml` und `Dockerfile`.
