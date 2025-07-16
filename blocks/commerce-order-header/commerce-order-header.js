/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-extraneous-dependencies */
import { events } from '@dropins/tools/event-bus.js';
import { Header, provider as uiProvider } from '@dropins/tools/components.js';
import { OrdersListCard } from '@dropins/storefront-account/components/OrdersListCard/OrdersListCard.js';
import { CUSTOMER_ORDER_DETAILS_PATH, CUSTOMER_ORDERS_PATH, UPS_TRACKING_URL } from '../../scripts/constants.js';
import { fetchPlaceholders } from '../../scripts/aem.js';

export default async function decorate(block) {
  block.innerHTML = '';

  const headerContainer = document.createElement('div');
  const orderCardContainer = document.createElement('div');
  orderCardContainer.classList.add('order-card-container');
  
  await uiProvider.render(Header, { title: 'Order' })(headerContainer);

  if (window.location.href.includes(CUSTOMER_ORDER_DETAILS_PATH)) {
    const placeholders = await fetchPlaceholders();

    const link = document.createElement('a');
    link.innerText = placeholders?.Custom?.CommerceOrderHeader?.backToAllOrders;
    link.href = CUSTOMER_ORDERS_PATH;
    link.classList.add('orders-list-link');

    block.appendChild(link);
  }

  block.appendChild(headerContainer);
  block.appendChild(orderCardContainer);

  events.on('order/data', (orderData) => {
    uiProvider.render(Header, { title: `Order ${orderData.number}` })(headerContainer);
    
    // Render the order card with full order details
    uiProvider.render(OrdersListCard, {
      item: orderData,
      minifiedView: false,
      withThumbnails: true,
      routeTracking: ({ carrier, number }) => {
        if (carrier === 'ups') {
          return `${UPS_TRACKING_URL}?tracknum=${number}`;
        }
        return '';
      },
      routeOrderProduct: (productData) => 
        productData?.product ? `/products/${productData.product.urlKey}/${productData.product.sku}` : '#',
    })(orderCardContainer);
  }, { eager: true });
}
