/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-extraneous-dependencies */
import { render as orderRenderer } from '@dropins/storefront-order/render.js';
import { OrdersList } from '@dropins/storefront-account/containers/OrdersList.js';
import { checkIsAuthenticated } from '../../scripts/configs.js';
import { 
  CUSTOMER_LOGIN_PATH, 
  CUSTOMER_ORDER_DETAILS_PATH,
  CUSTOMER_ORDERS_PATH,
  UPS_TRACKING_URL 
} from '../../scripts/constants.js';
import { readBlockConfig } from '../../scripts/aem.js';

// Initialize order functionality
import '../../scripts/initializers/order.js';

export default async function decorate(block) {
  const { 'minified-view': minifiedViewConfig = 'false' } = readBlockConfig(block);

  // Redirect if not authenticated
  if (!checkIsAuthenticated()) {
    window.location.href = CUSTOMER_LOGIN_PATH;
    return;
  }

  // Render order history component using the existing OrdersList component
  await orderRenderer.render(OrdersList, {
    minifiedView: minifiedViewConfig === 'true',
    routeTracking: ({ carrier, number }) => {
      if (carrier === 'ups') {
        return `${UPS_TRACKING_URL}?tracknum=${number}`;
      }
      return '';
    },
    routeOrdersList: () => CUSTOMER_ORDERS_PATH,
    routeOrderDetails: (orderNumber) => `${CUSTOMER_ORDER_DETAILS_PATH}?orderRef=${orderNumber}`,
    routeOrderProduct: (productData) => (
      productData?.product ? 
        `/products/${productData.product.urlKey}/${productData.product.sku}` : 
        '#'
    ),
  })(block);
} 