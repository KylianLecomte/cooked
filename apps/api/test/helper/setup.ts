import { ExecutionContext, INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AuthGuard } from "@thallesp/nestjs-better-auth";
import { AppModule } from "src/app.module";
import { PrismaService } from "src/prisma/prisma.service";
import { API_PREFIX } from "src/util/constant";

export const TEST_USER_ID = "test_user_1";

export const TEST_USER = {
  id: TEST_USER_ID,
  email: "test@test.com",
  name: "Test User",
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  })
    // Mock l'AuthGuard (Better auth) pour injecter un faux user
    .overrideGuard(AuthGuard)
    .useValue({
      canActivate: (context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest();
        request.session = {
          user: { ...TEST_USER },
        };
        return true;
      },
    })
    .compile();

  const app = moduleFixture.createNestApplication();
  app.setGlobalPrefix(API_PREFIX);

  await app.init();
  await seedTestUser(app);

  return app;
}

export async function seedTestUser(app: INestApplication): Promise<void> {
  const prisma = app.get(PrismaService);
  await prisma.client.user.upsert({
    where: { id: TEST_USER_ID },
    update: {},
    create: { ...TEST_USER },
  });
}

export async function cleanDatabase(app: INestApplication): Promise<void> {
  const prisma = app.get(PrismaService);
  await prisma.client.foodLog.deleteMany();
  await prisma.client.diaryEntry.deleteMany();
  await prisma.client.food.deleteMany();
}
