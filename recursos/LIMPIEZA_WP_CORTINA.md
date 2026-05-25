# Limpieza JetEngine — Cortina Studio (post-refactor Tier A/B/C)

**Fecha:** 2026-05-17
**Motivo:** Mover todo el copy estatico de WordPress a `messages/{es,en}.json`. Solo quedan en WP los datos operativos (contacto/redes) y dinamicos (proyectos + selector de reels).

---

## 1. En JetEngine → Post Types → `home-singleton` → Meta Fields

### BORRAR estos campos

**Escalares:**
- `hero_eyebrow`
- `hero_title`
- `hero_subtitle`
- `hero_cta_label`
- `hero_cta_message`
- `problems_eyebrow`
- `problems_title`
- `problems_subtitle`
- `reels_eyebrow`
- `reels_title`
- `reels_subtitle`
- `reels_cta_text`
- `reels_cta_button`
- `reels_whatsapp_message`
- `process_eyebrow`
- `process_title_prefix_m`
- `process_title_prefix_f`
- `process_title_suffix`
- `process_subtitle`
- `process_cta_label`

**Repeaters:**
- `problems_cards`
- `process_rotating_words`
- `process_steps`

### MANTENER estos campos

- `hero_image` (asset)
- `hero_image_caption` (texto corto, monolingue por ahora)
- `reels_selected` (repeater de IDs de proyectos)

---

## 2. En JetEngine → Options Pages → `General` → Meta Fields

### BORRAR estos campos

**Escalares:**
- `whatsapp_default_message`
- `brand_name`
- `footer_cta_title`
- `footer_cta_description`
- `footer_cta_button`
- `footer_copyright`

**Repeaters:**
- `nav_items`

### MANTENER estos campos

- `whatsapp_number`
- `contact_phone`
- `contact_email`
- `contact_address`
- `social_instagram`
- `social_tiktok`
- `social_facebook`
- `brand_logo`

---

## 3. Pasos en orden

1. **Backup** del schema actual de JetEngine (export JSON de los Post Types y Options).
2. Borrar los meta fields listados arriba en JetEngine.
3. Confirmar en el GraphQL IDE de WPGraphQL que los queries `homeSingletons` y `general` ya no exponen los campos eliminados (los campos eliminados deben desaparecer del schema).
4. En el repo, correr `npm run codegen` para regenerar `lib/graphql/generated/index.ts` con los tipos adelgazados.
5. Correr `npx tsc --noEmit` y `npm run lint` para confirmar que todo sigue verde.
6. Probar `/es` y `/en` localmente.
7. Una vez confirmado, **borrar este archivo** — es de un solo uso.

---

## Resumen numerico

- **Antes:** 22 escalares + 4 repeaters de copy + 8 escalares + 1 repeater de Options = **35 campos en WP**.
- **Despues:** 2 escalares + 1 repeater en home + 8 escalares en Options = **11 campos en WP**.
- **Reduccion: 68%** del setup de WP por cliente.
