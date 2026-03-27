export const TEST_USER_ID = "test_user_1";

export const TEST_USER = {
  id: TEST_USER_ID,
  email: "test@test.com",
  name: "Test User",
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const SESSION = {
  user: { ...TEST_USER },
};
