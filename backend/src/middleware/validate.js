// Validation helper using zod
import { z } from 'zod';

export const validate = (schema, source = 'body') => (req, res, next) => {
  try {
    const data = schema.parse(req[source]);
    req[source] = data;
    next();
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors?.map((e) => ({ path: e.path.join('.'), message: e.message })) || [],
    });
  }
};

export const schemas = {
 register: z.object({
  name: z.string().min(2).max(80),

  phone: z.string().min(10).max(15).optional(),
  otpVerified: z.boolean().optional(),
}),
 login: z.object({
  phone: z.string().min(10).max(15),
}),
  product: z.object({
    name: z.string().min(3).max(200),
    description: z.string().max(5000).optional(),
    basePrice: z.number().positive(),
    discountPrice: z.number().nonnegative().optional(),
    categoryId: z.string().min(1),
    subcategoryId: z.string().optional(),
    bundleAvailable: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    isNewArrival: z.boolean().optional(),
    isOnOffer: z.boolean().optional(),
  }),
  cartItem: z.object({
    productId: z.string().min(1),
    size: z.string().min(1),
    color: z.string().min(1),
    quantity: z.number().int().min(1).max(99),
    variantId: z.string().optional(),
  }),
  order: z.object({
    items: z.array(
      z.object({
        productId: z.string(),
        size: z.string(),
        color: z.string(),
        quantity: z.number().int().min(1),
        price: z.number(),
      })
    ).min(1),
    addressId: z.string().optional(),
    paymentMethod: z.string().default('RAZORPAY'),
    couponCode: z.string().optional(),
  }),
  review: z.object({
    rating: z.number().int().min(1).max(5),
    title: z.string().max(200).optional(),
    comment: z.string().max(2000).optional(),
  }),
  newsletter: z.object({
    email: z.string().email(),
  }),
};
