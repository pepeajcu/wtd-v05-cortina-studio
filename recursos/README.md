# `recursos/` — Plantillas y exports de fábrica

Carpeta de artefactos reutilizables al levantar un cliente nuevo. NO contiene código que se ejecute; es fuente para imports manuales en WordPress y referencia documental.

## Inventario esperado

| Archivo | Origen | Uso |
|---|---|---|
| `jetengine-cortinastudio.json` | Export manual desde WP (ver abajo) | Importar como base de los CPTs y meta fields del próximo cliente |
| `ESTADO_PROYECTO_Claude.md` | Snapshot de avance — referencia interna | Onboarding rápido entre sesiones |
| `ESTADO_PROYECTO_Opencode.md` | Idem para runner OpenCode | Idem |

> El export de JetEngine aún no está aquí — pendiente bullet 4 de Fase 5 (`docs/specs/001-plan-inicial/task.md:184`).

---

## Cómo generar el export de JetEngine (manual, en WP)

1. Entrar al panel de WordPress del CMS de Cortina Studio (`https://cortinastudio.gainweb.site/wp-admin`).
2. **JetEngine → Tools → Export**.
3. Marcar:
   - **Post Types**: `home`, `proyecto`
   - **Meta Boxes**: todos los asociados a esos CPTs
   - **Options Pages**: `general`
4. Descargar el JSON resultante.
5. Guardarlo en este directorio como `jetengine-cortinastudio.json`.
6. Commit + push.

## Cómo usarlo en un cliente nuevo

1. En el WP del cliente nuevo, con JetEngine ya instalado: **JetEngine → Tools → Import**.
2. Subir `jetengine-cortinastudio.json`.
3. Renombrar slugs y labels en cada CPT/Options Page según el nuevo cliente.
4. Sincronizar los meta keys resultantes con `wp-config.json.fields.*` y `wordpress/plugins/cortinastudio-wpgraphql-bridge/bridge-fields.json` (mirror obligatorio — ver `replicacion-cliente` skill).

## Notas

- El export contiene SOLO la estructura (definiciones de CPT, fields, options page). NO trae contenido de posts ni opciones rellenadas.
- Si el plugin `cortinastudio-wpgraphql-bridge` cambia de versión, también debe quedar reflejado en este export o en un README adjunto.
