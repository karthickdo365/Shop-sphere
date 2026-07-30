import prisma from "../config/db.js";

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).send("Invalid verification link.");
    }

    // Find verification record
    const record = await prisma.emailVerification.findUnique({
      where: { token },
    });

    if (!record) {
      return res.status(400).send("Invalid verification link.");
    }

    // Check if expired
    if (record.expiresAt < new Date()) {
      return res.status(400).send("Verification link has expired.");
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: record.email },
    });

    if (existingUser) {
      return res.redirect(
        `${process.env.APP_URL}/login?verified=true`
      );
    }

    // Create actual user
    const user = await prisma.user.create({
      data: {
        name: record.name,
        email: record.email,
        password: record.password,
        isEmailVerified: true,
      },
    });

    // Create cart
    await prisma.cart.create({
      data: {
        userId: user.id,
      },
    });

    // Delete verification record
    await prisma.emailVerification.delete({
      where: {
        id: record.id,
      },
    });

    // Redirect to login page
    return res.redirect(
      `${process.env.APP_URL}/login?verified=true`
    );

  } catch (err) {
    console.error("Email verification error:", err);

    return res.status(500).send("Internal Server Error");
  }
};