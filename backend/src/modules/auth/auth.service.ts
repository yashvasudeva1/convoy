import { prisma } from "../../config/db";
import { AppError } from "../../middleware/errorHandler";
import { comparePassword } from "../../utils/password";
import { signToken } from "../../utils/jwt";

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });

  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) {
    throw new AppError(401, "Invalid email or password");
  }

  const token = signToken({ sub: user.id, email: user.email, role: user.role.name });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name,
    },
  };
}
