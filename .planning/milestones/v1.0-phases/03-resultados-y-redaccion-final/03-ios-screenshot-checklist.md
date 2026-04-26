# APP-07 iOS Screenshot Checklist

Goal: capture the 3 required screenshots in iOS simulator and place them in docs/paper/figures.

## Output files (exact names)

- docs/paper/figures/figura-2-transacciones.png
- docs/paper/figures/figura-3-informe-mensual.png
- docs/paper/figures/figura-4-presupuestos-trigger.png

## Preconditions

- Node modules installed:
  - npm install
- Expo app starts:
  - npm run ios
- App database initialized and base data visible.

## Recommended data setup (inside app)

1. Add at least 1 account and 2 categories (one gasto, one ingreso).
2. Create one budget for current month for a gasto category.
3. Insert 3-5 transactions in current month including at least one gasto tied to budget category.
4. Open monthly report and ensure category totals are visible.
5. Open budgets tab and confirm restante changed after gasto insert.

## Capture method A (iOS Simulator menu)

For each target screen:

1. Focus the iOS Simulator window.
2. Menu path: File -> Save Screen Shot.
3. Save to temporary location.
4. Rename/move to required filename in docs/paper/figures.

## Capture method B (macOS host command, optional)

If using macOS host terminal with simulator booted:

- xcrun simctl io booted screenshot docs/paper/figures/figura-2-transacciones.png
- xcrun simctl io booted screenshot docs/paper/figures/figura-3-informe-mensual.png
- xcrun simctl io booted screenshot docs/paper/figures/figura-4-presupuestos-trigger.png

Note: this command is not available in Windows-only shells; use method A in that case.

## Composition guidance per screenshot

### figura-2-transacciones.png
- Tab: Transacciones
- Must show list entries with date, tipo, importe, cuenta and categoria.
- Avoid modal overlays.

### figura-3-informe-mensual.png
- Tab: Informe mensual
- Must show monthly grouped totals by category.
- Keep month filter visible if possible.

### figura-4-presupuestos-trigger.png
- Tab: Presupuestos
- Must show limite and restante for at least one category.
- Ensure restante reflects a gasto already inserted.

## Quick verification (APP-07)

- [ ] All 3 files exist under docs/paper/figures with exact names.
- [ ] PNG format confirmed.
- [ ] Images are readable at presentation scale.
- [ ] Figure references in docs/paper/06-resultados-pruebas.md match filenames.
- [ ] Commit includes only screenshots and optional doc reference updates.

## Suggested commit message

docs(phase03): add iOS simulator screenshots for APP-07 evidence
