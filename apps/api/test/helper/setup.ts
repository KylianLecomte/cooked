import { ExecutionContext, INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AuthGuard } from "@thallesp/nestjs-better-auth";
import { AppModule } from "src/app.module";
import { SESSION, TEST_USER, TEST_USER_ID } from "src/auth/fixture/auth.fixture";
import { createMockOffService, createMockUsdaService } from "src/food/mock/food.mock";
import { OffService } from "src/food/service/off.service";
import { UsdaService } from "src/food/service/usda.service";
import { PrismaService } from "src/prisma/prisma.service";
import { API_PREFIX } from "src/util/constant";
import { GlobalZodValidationPipe } from "src/zod/pipe/global-zod-validation.pipe";

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  })
    // Mock l'AuthGuard (Better auth) pour injecter un faux user
    .overrideGuard(AuthGuard)
    .useValue({
      canActivate: (context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest();
        request.session = { ...SESSION };
        return true;
      },
    })
    .compile();

  const app = moduleFixture.createNestApplication();
  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalPipes(new GlobalZodValidationPipe());

  await app.init();
  await seedTestUser(app);

  return app;
}

export async function createTestAppWithMockedApis(): Promise<INestApplication> {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  })
    // Mock l'AuthGuard
    .overrideGuard(AuthGuard)
    .useValue({
      canActivate: (context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest();
        request.session = { ...SESSION };
        return true;
      },
    })
    // Mock les APIs externes pour des tests déterministes
    .overrideProvider(UsdaService)
    .useValue(createMockUsdaService())
    .overrideProvider(OffService)
    .useValue(createMockOffService())
    .compile();

  const app = moduleFixture.createNestApplication();
  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalPipes(new GlobalZodValidationPipe());

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
  await prisma.client.profile.deleteMany();
}
