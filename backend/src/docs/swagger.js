// OpenAPI / Swagger spec for EN3 Fashions API
const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'EN3 Fashions API',
    version: '1.0.0',
    description: `
      REST API for the EN3 Fashions e-commerce clone.

      ## Authentication
      Most endpoints require a JWT bearer token obtained via \`/api/auth/login\` or \`/api/auth/register\`.
      Send the token in the \`Authorization\` header as: \`Bearer <token>\`.

      ## Features
      - Product catalog with categories, subcategories, filters
      - User authentication & authorization (CUSTOMER / ADMIN)
      - Shopping cart (per-user)
      - Wishlist
      - Reviews & ratings
      - Order placement with Razorpay-style payment flow
      - Coupons
      - Newsletter signup
      - File uploads (admin)
    `,
    contact: { name: 'EN3 Fashions', url: 'https://en3fashions.in' },
  },
  servers: [
    { url: 'http://localhost:5000', description: 'Local dev' },
  ],
  tags: [
    { name: 'Auth', description: 'Authentication endpoints' },
    { name: 'Products', description: 'Product catalog' },
    { name: 'Categories', description: 'Categories & subcategories' },
    { name: 'Cart', description: 'Shopping cart' },
    { name: 'Orders', description: 'Order placement & history' },
    { name: 'Wishlist', description: 'User wishlist' },
    { name: 'Reviews', description: 'Product reviews' },
    { name: 'Coupons', description: 'Coupon validation' },
    { name: 'Newsletter', description: 'Newsletter signup' },
    { name: 'Uploads', description: 'Image uploads (admin)' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          phone: { type: 'string' },
          role: { type: 'string', enum: ['CUSTOMER', 'ADMIN'] },
        },
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          slug: { type: 'string' },
          description: { type: 'string' },
          basePrice: { type: 'number' },
          discountPrice: { type: 'number', nullable: true },
          currency: { type: 'string' },
          bundleAvailable: { type: 'boolean' },
          bundleLabel: { type: 'string', nullable: true },
          isFeatured: { type: 'boolean' },
          isNewArrival: { type: 'boolean' },
          isOnOffer: { type: 'boolean' },
          rating: { type: 'number' },
          numReviews: { type: 'integer' },
          images: {
            type: 'array',
            items: {
              type: 'object',
              properties: { id: { type: 'string' }, url: { type: 'string' }, alt: { type: 'string' } },
            },
          },
          variants: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                size: { type: 'string' },
                color: { type: 'string' },
                stock: { type: 'integer' },
                sku: { type: 'string' },
              },
            },
          },
        },
      },
      Category: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          slug: { type: 'string' },
          description: { type: 'string' },
          image: { type: 'string' },
        },
      },
      Cart: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                productId: { type: 'string' },
                product: { $ref: '#/components/schemas/Product' },
                size: { type: 'string' },
                color: { type: 'string' },
                quantity: { type: 'integer' },
                priceAtAdd: { type: 'number' },
              },
            },
          },
        },
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          orderNumber: { type: 'string' },
          subtotal: { type: 'number' },
          shipping: { type: 'number' },
          tax: { type: 'number' },
          total: { type: 'number' },
          status: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'] },
          paymentStatus: { type: 'string', enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'] },
          items: { type: 'array', items: { type: 'object' } },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

export default swaggerSpec;
