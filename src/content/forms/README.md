# Repo-editable forms (JSON)

These form definitions are **not** managed by Payload CMS. Edit the JSON files in this folder (`src/content/forms/`) to change fields, labels, options, and validation without touching TypeScript.

- **personal.json** – Portal: Personligt (personal settings)
- **business.json** – Portal: Verksamhet (business/creative profile)
- **account.json** – Portal: Konto (account settings; currently empty)
- **medlemskap.json** – Public: Ansökan om medlemskap (membership application)

## Structure

Each file has:

- **sections** – Array of `{ "title": "...", "fields": [...] }`
- **fields** – `name`, `label`, `fieldType`, `required`, `placeholder`, `helpText`, `options` (for select), etc.
- **submitButtonLabel**, **successMessage**, **showSuccessMessage** – Button and success text
- Optional: **submitButtonVariant**, **submitSectionTitle**, **submitButtonClassName**, **submitButtonSize** (see medlemskap.json)

## Field types

`text`, `email`, `tel`, `date`, `textarea`, `select`, `checkbox`, `number`, `state`, `country`, `url`, `message`.

## Validation presets

Use `"validation": "swedishPostcode"` for Swedish postcode (5 digits). Other presets can be added in `src/lib/loadFormFromJson.ts`.

## Conditional fields

To show a field only when another has a value, add:

```json
"conditionalField": { "field": "creativeField", "value": "other", "operator": "equals" }
```

## Payload forms

Forms created in the Payload admin (Form Builder) are separate and stored in the database. They are used when you add a Form block to a page. This folder is only for the fixed forms listed above.
