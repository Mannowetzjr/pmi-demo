import { h } from '@dropins/tools/preact.js';
import { useState, useEffect } from '@dropins/tools/preact-hooks.js';
import { checkIsAuthenticated } from '../../scripts/configs.js';

export default function CredentialManager() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication state on mount and when it changes
  useEffect(() => {
    const updateAuthState = () => {
      setIsAuthenticated(checkIsAuthenticated());
    };

    // Initial check
    updateAuthState();

    // Listen for authentication changes (login/logout events)
    const handleAuthChange = () => {
      updateAuthState();
    };

    // Listen for storage changes (when auth token is added/removed)
    window.addEventListener('storage', handleAuthChange);
    
    // Listen for custom auth events that might be fired by the auth system
    document.addEventListener('auth:login', handleAuthChange);
    document.addEventListener('auth:logout', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleAuthChange);
      document.removeEventListener('auth:login', handleAuthChange);
      document.removeEventListener('auth:logout', handleAuthChange);
    };
  }, []);

  // Load credentials only if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      fetch('/data/credential-manager-users.json')
        .then(res => {
          if (!res.ok) throw new Error('Failed to load credentials');
          return res.json();
        })
        .then(setUsers)
        .catch(e => setError(e.message));
    }
  }, [isAuthenticated]);

  // Autofill logic
  const autofill = (user) => {
    const emailField = document.querySelector('input[name="email"]');
    const passwordField = document.querySelector('input[name="password"]');
    
    if (emailField) {
      emailField.value = user.email;
      emailField.dispatchEvent(new Event('input', { bubbles: true }));
      emailField.dispatchEvent(new Event('change', { bubbles: true }));
    }

    if (passwordField) {
      passwordField.value = user.password;
      passwordField.dispatchEvent(new Event('input', { bubbles: true }));
      passwordField.dispatchEvent(new Event('change', { bubbles: true }));
    }

    setShowModal(false);
  };

  // Styles
  const styles = {
    button: {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 10000,
      background: 'none',
      color: 'white',
      border: '2px solid rgba(236, 15, 15, 0.15)',
      borderRadius: '10%',
      width: '48px',
      height: '48px',
      fontSize: '24px',
      cursor: 'pointer',
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.3)',
      zIndex: 10001,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    modal: {
      background: 'white',
      borderRadius: '8px',
      padding: '24px',
      minWidth: '320px',
      maxWidth: '90vw',
      boxShadow: '0 2px 16px rgba(0,0,0,0.2)',
    },
    userList: {
      margin: '16px 0',
      maxHeight: '200px',
      overflowY: 'auto',
    },
    userRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '8px',
      gap: '8px',
    },
    actions: {
      display: 'flex',
      gap: '8px',
      marginTop: '8px',
    },
    // Primary button styles (for Autofill)
    primaryButton: {
      boxSizing: 'border-box',
      display: 'inline-block',
      border: 'var(--shape-border-width-3, 3px) solid transparent',
      borderRadius: 'var(--shape-border-radius-3, 4px)',
      padding: '0.5em 1.2em',
      font: 'var(--type-button-2-font, inherit)',
      letterSpacing: 'var(--type-button-2-letter-spacing, normal)',
      fontWeight: 500,
      lineHeight: 1.25,
      textAlign: 'center',
      textDecoration: 'none',
      backgroundColor: 'var(--color-brand-700, #1473e6)',
      color: 'var(--color-neutral-50, #fff)',
      cursor: 'pointer',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    // Tertiary button styles (for Close)
    tertiaryButton: {
      background: 'none',
      border: 'none',
      padding: '0.5em 1em',
      font: 'var(--type-button-2-font, inherit)',
      letterSpacing: 'var(--type-button-2-letter-spacing, normal)',
      fontWeight: 500,
      color: 'var(--color-neutral-700, #666)',
      cursor: 'pointer',
      textDecoration: 'none',
      marginTop: '16px',
    },
  };

  // Don't render if user is authenticated
  if (isAuthenticated) {
    return null;
  }

  return h('div', null, [
    h('button', {
      style: styles.button,
      title: 'Credential Manager',
      onClick: () => setShowModal(true),
    }, '👤'),
    showModal && h('div', {
      style: styles.modalOverlay,
      onClick: () => setShowModal(false),
    }, [
      h('div', {
        style: styles.modal,
        onClick: e => e.stopPropagation(),
      }, [
        h('h3', null, 'Credential Manager'),
        error && h('div', { style: { color: 'red' } }, `Error: ${error}`),
        h('div', { style: styles.userList }, [
          users.length === 0 && !error && h('div', null, 'No users available.'),
          users.map((user, idx) => h('div', {
            key: idx,
            style: styles.userRow,
          }, [
            h('span', null, user.email),
            h('div', { style: styles.actions }, [
              h('button', {
                type: 'button',
                style: styles.primaryButton,
                onClick: () => autofill(user),
                onMouseEnter: (e) => {
                  e.target.style.backgroundColor = 'var(--color-button-hover, #0054b6)';
                },
                onMouseLeave: (e) => {
                  e.target.style.backgroundColor = 'var(--color-brand-700, #1473e6)';
                },
              }, 'Autofill'),
            ]),
          ])),
        ]),
        h('button', {
          style: styles.tertiaryButton,
          onClick: () => setShowModal(false),
          onMouseEnter: (e) => {
            e.target.style.textDecoration = 'underline';
            e.target.style.color = 'var(--color-neutral-800, #3d3d3d)';
          },
          onMouseLeave: (e) => {
            e.target.style.textDecoration = 'none';
            e.target.style.color = 'var(--color-neutral-700, #666)';
          },
        }, 'Close'),
      ]),
    ]),
  ]);
} 