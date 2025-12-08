import { Injectable, NotFoundException } from "@nestjs/common";

import { Prisma, Sex } from "../../generated/prisma/client";
import { PrismaService } from "../../db/prisma.service";

interface UpdateUserProfileData {
  sex?: Sex | null;
}

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async updateUserProfile(id: string, data: UpdateUserProfileData) {
    const updateData: Prisma.UserUpdateInput = {};

    if (data.sex !== undefined) {
      updateData.sex = data.sex ?? null;
    }

    if (Object.keys(updateData).length === 0) {
      return this.getUserById(id);
    }

    try {
      return await this.prisma.user.update({ where: { id }, data: updateData });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundException("User not found");
      }

      throw error;
    }
  }
}
