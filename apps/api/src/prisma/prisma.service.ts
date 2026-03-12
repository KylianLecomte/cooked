import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { prisma } from "./prisma.instance";

// PrismaService expose l'instance unique de PrismaClient dans le conteneur DI de NestJS
// L'instance est créée dans prisma.instance.ts et partagée avec Better Auth (auth.ts)
// Cela évite d'ouvrir deux pools de connexions PostgreSQL distincts
//
// On n'étend pas PrismaClient ici car l'instance est créée en dehors du constructeur
// (nécessaire pour que Better Auth y accède avant l'initialisation de NestJS)
// À la place, on délègue toutes les opérations via la propriété `client`
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  // L'instance PrismaClient unique — utiliser prismaService.client dans les services
  // Ex: this.prisma.client.user.findMany()
  readonly client = prisma;

  async onModuleInit(): Promise<void> {
    await this.client.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.$disconnect();
  }
}
