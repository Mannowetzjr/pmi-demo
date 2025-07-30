# Credential Manager Block

A reusable development tool that provides quick access to test credentials for form autofill.

## Features

- Floating button interface that appears on any page
- **Automatically hides when user is logged in** - Only shows for unauthenticated users
- Modal with list of available test credentials
- One-click autofill for email and password fields
- Consistent styling with storefront design system
- Framework-agnostic implementation
- Real-time authentication state monitoring

## Usage

### Adding to a Page

Add the credential manager block to any page where you need credential autofill:

```html
<div class="credential-manager">
  <div>
    <!-- Block content (can be empty) -->
  </div>
</div>
```

### Data Configuration

The block reads credentials from `/data/credential-manager-users.json`:

```json
[
  {
    "email": "test@example.com",
    "password": "Password1"
  },
  {
    "email": "admin@example.com", 
    "password": "AdminPass123"
  }
]
```

### Form Compatibility

The autofill feature automatically detects and fills:
- Email fields: `input[name="email"]`
- Password fields: `input[name="password"]`

### Authentication Behavior

The credential manager automatically detects user authentication state:
- **Shows**: When user is not logged in (no `auth_dropin_user_token` cookie)
- **Hides**: When user is authenticated (has valid auth token)
- **Real-time updates**: Automatically appears/disappears when login/logout occurs
- **Event listening**: Monitors storage changes and custom auth events

## Styling

The block uses the storefront design system:
- **Primary buttons** (Autofill) - Brand colors with hover effects
- **Tertiary buttons** (Close) - Minimal styling with underline on hover
- **CSS Variables** - Inherits from design tokens for consistency

## Files

- `credential-manager.js` - Main block decorator function
- `CredentialManager.js` - React/Preact component
- `credential-manager.css` - Block-specific styles
- `README.md` - This documentation

## Security Note

This is a **development tool only**. Do not include credential data in production environments. 