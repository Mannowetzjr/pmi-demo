/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-extraneous-dependencies */
import { render as accountRenderer } from '@dropins/storefront-account/render.js';
import { OrdersList } from '@dropins/storefront-account/containers/OrdersList.js';
import { initializers } from '@dropins/tools/initializer.js';
import { checkIsAuthenticated, getHeaders } from '../../scripts/configs.js';
import { 
  CUSTOMER_LOGIN_PATH, 
  CUSTOMER_ORDER_DETAILS_PATH,
  CUSTOMER_ORDERS_PATH,
  CUSTOMER_RETURN_DETAILS_PATH,
  UPS_TRACKING_URL 
} from '../../scripts/constants.js';
import { readBlockConfig, fetchPlaceholders } from '../../scripts/aem.js';

// Initialize account functionality
import '../../scripts/initializers/account.js';

export default async function decorate(block) {
  console.log('Starting commerce-order-history decoration');
  
  const { 'minified-view': minifiedViewConfig = 'false' } = readBlockConfig(block);
  console.log('Config loaded:', { minifiedViewConfig });

  if (!checkIsAuthenticated()) {
    console.log('User not authenticated, redirecting to login');
    window.location.href = CUSTOMER_LOGIN_PATH;
    return;
  }

  console.log('User authenticated, preparing to render OrdersList');
  try {
    // Ensure the block is empty before rendering
    block.textContent = '';
    
    // Create a container for the orders list
    const ordersContainer = document.createElement('div');
    ordersContainer.className = 'orders-list-container';
    block.appendChild(ordersContainer);

    // Initialize with proper configuration
    console.log('Fetching placeholders and headers...');
    const labels = await fetchPlaceholders();
    const headers = await getHeaders('account');
    console.log('Fetched configuration:', { 
      hasLabels: !!labels, 
      hasHeaders: !!headers 
    });

    const langDefinitions = {
      default: {
        ...labels,
      },
    };

    // Mount the initializer with proper configuration
    console.log('Mounting initializer for OrdersList...');
    try {
      await initializers.mountImmediately(OrdersList, { 
        langDefinitions,
        headers
      });
      console.log('Initializers mounted successfully');
    } catch (initError) {
      console.error('Error mounting initializer:', initError);
      throw initError;
    }

    // Prepare render configuration
    console.log('Preparing OrdersList render configuration...');
    const renderConfig = {
      minifiedView: minifiedViewConfig === 'true',
      pageSize: 10,
      routeTracking: ({ carrier, number }) => {
        if (carrier === 'ups') {
          return `${UPS_TRACKING_URL}?tracknum=${number}`;
        }
        return '';
      },
      routeOrdersList: () => CUSTOMER_ORDERS_PATH,
      routeOrderDetails: (orderNumber) => `${CUSTOMER_ORDER_DETAILS_PATH}?orderRef=${orderNumber}`,
      routeReturnDetails: ({ orderNumber, returnNumber }) => 
        `${CUSTOMER_RETURN_DETAILS_PATH}?orderRef=${orderNumber}&returnRef=${returnNumber}`,
      routeOrderProduct: (productData) => (
        productData?.product ? 
          `/products/${productData.product.urlKey}/${productData.product.sku}` : 
          '#'
      )
    };
    console.log('Render configuration prepared:', renderConfig);

    // Render the orders list
    console.log('Rendering OrdersList...');
    try {
      await accountRenderer.render(OrdersList, renderConfig)(ordersContainer);
      console.log('OrdersList rendered successfully');
    } catch (renderError) {
      console.error('Error during OrdersList render:', renderError);
      throw renderError;
    }
  } catch (error) {
    console.error('Error in commerce-order-history:', error);
    // Add visual error feedback
    block.innerHTML = `
      <div class="error-message">
        Sorry, we couldn't load your orders at this time. Please try again later.
        ${error.message ? `<br>Error: ${error.message}` : ''}
      </div>
    `;
  }
  console.log('Finished commerce-order-history decoration');
} 