import { h } from '@dropins/tools/preact.js';
import { useState, useEffect } from '@dropins/tools/preact-hooks.js';

export default function CredentialManager() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/data/credential-manager-users.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load credentials');
        return res.json();
      })
      .then(setUsers)
      .catch(e => setError(e.message));
  }, []);

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

  // Only render on /customer/login
  useEffect(() => {
    if (!window.location.pathname.startsWith('/customer/login')) {
      setShowModal(false);
    }
  }, []);

  // Styles
  const styles = {
    button: {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 10000,
      background: '#0070f3',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '48px',
      height: '48px',
      fontSize: '24px',
      cursor: 'pointer',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
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
  };

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
                onClick: () => autofill(user),
              }, 'Autofill'),
            ]),
          ])),
        ]),
        h('button', {
          style: { marginTop: '16px' },
          onClick: () => setShowModal(false),
        }, 'Close'),
      ]),
    ]),
  ]);
} 