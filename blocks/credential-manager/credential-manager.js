/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-extraneous-dependencies */
import { h, render } from '@dropins/tools/preact.js';
import CredentialManager from './CredentialManager.js';

export default async function decorate(block) {
  // Create container div for the credential manager
  const credDiv = document.createElement('div');
  credDiv.className = 'credential-manager-container';
  
  // Replace the block content with the credential manager
  block.innerHTML = '';
  block.appendChild(credDiv);
  
  // Render the credential manager component
  render(h(CredentialManager, {}), credDiv);
} 