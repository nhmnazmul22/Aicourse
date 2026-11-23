import { expect, test, type Page } from "@playwright/test";

async function setupMockBoard(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem(
      "auth-storage",
      JSON.stringify({
        state: {
          user: { id: "u1", email: "user@example.com", name: "Tester" },
          token: "jwt-test-token",
        },
        version: 0,
      })
    );
  });

  const state = {
    projects: [{ id: "p1", name: "Product sprint", userId: "u1" }],
    columns: [
      {
        id: "backlog",
        name: "Backlog",
        cards: [
          { id: "c1", title: "Map the onboarding flow", details: "Detail 1", columnId: "backlog", position: 0 },
        ],
      },
      {
        id: "todo",
        name: "To do",
        cards: [],
      },
      {
        id: "inprogress",
        name: "In progress",
        cards: [],
      },
      {
        id: "review",
        name: "Review",
        cards: [],
      },
      {
        id: "done",
        name: "Done",
        cards: [
          { id: "c2", title: "Set up project workspace", details: "Detail 2", columnId: "done", position: 0 },
        ],
      },
    ],
  };

  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ user: { id: "u1", email: "user@example.com", name: "Tester" } }),
    });
  });

  await page.route("**/api/projects", async (route) => {
    if (route.request().method() === "POST") {
      const data = JSON.parse(route.request().postData() || "{}");
      const newProj = { id: `p-${Date.now()}`, name: data.name, userId: "u1" };
      state.projects.push(newProj);
      await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ project: newProj }) });
    } else {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ projects: state.projects }) });
    }
  });

  await page.route("**/api/projects/p1/board", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ project: state.projects[0], columns: state.columns }),
    });
  });

  await page.route("**/api/projects/p1/columns/*", async (route) => {
    const data = JSON.parse(route.request().postData() || "{}");
    const colId = route.request().url().split("/").pop();
    const col = state.columns.find((c) => c.id === colId);
    if (col && data.name) col.name = data.name;
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ column: col }) });
  });

  await page.route("**/api/projects/p1/columns/*/cards", async (route) => {
    const data = JSON.parse(route.request().postData() || "{}");
    const newCard = { id: `c-${Date.now()}`, title: data.title, details: data.details, columnId: "todo", position: 0 };
    await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ card: newCard }) });
  });

  await page.route("**/api/projects/p1/columns/*/cards/*", async (route) => {
    if (route.request().method() === "DELETE") {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
    } else {
      const data = JSON.parse(route.request().postData() || "{}");
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ card: { id: "c1", ...data } }) });
    }
  });

  await page.route("**/api/projects/p1/cards/*/move", async (route) => {
    const data = JSON.parse(route.request().postData() || "{}");
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ card: data }) });
  });

  await page.route("**/api/ai/board", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ response: "AI task completed successfully.", updates: [] }),
    });
  });
}

test("shows login screen when unauthenticated and logs in", async ({ page }) => {
  await page.route("**/api/auth/login", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        user: { id: "u1", email: "user@example.com", name: "Tester" },
        token: "fake-jwt",
      }),
    });
  });
  await page.route("**/api/projects", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        projects: [{ id: "p1", name: "Product sprint", userId: "u1" }],
      }),
    });
  });
  await page.route("**/api/projects/p1/board", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        project: { id: "p1", name: "Product sprint", userId: "u1" },
        columns: [
          { id: "col-1", name: "Backlog", cards: [] },
          { id: "col-2", name: "To do", cards: [] },
          { id: "col-3", name: "In progress", cards: [] },
          { id: "col-4", name: "Review", cards: [] },
          { id: "col-5", name: "Done", cards: [] },
        ],
      }),
    });
  });

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();

  await page.getByLabel("Email address").fill("user@example.com");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.getByRole("heading", { name: "Product sprint" })).toBeVisible();
});

test("opens with a populated five-column sprint board", async ({ page }) => {
  await setupMockBoard(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Product sprint" })).toBeVisible();
  for (const name of ["Backlog", "To do", "In progress", "Review", "Done"]) {
    await expect(page.getByRole("region", { name: `${name} column` })).toBeVisible();
  }
  await expect(page.getByRole("article", { name: "Map the onboarding flow" })).toBeVisible();
});

test("renames a column and adds, edits, and deletes a card", async ({ page }) => {
  await setupMockBoard(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Product sprint" })).toBeVisible();

  const todoButton = page.getByRole("button", { name: "To do", exact: true });
  await todoButton.scrollIntoViewIfNeeded();
  await todoButton.click();
  const renameInput = page.getByLabel("Column name");
  await renameInput.fill("Ready next");
  await renameInput.press("Enter");

  const column = page.getByRole("region", { name: "Ready next column" });
  await expect(column).toBeVisible();
  await column.scrollIntoViewIfNeeded();

  const addCardBtn = column.getByRole("button", { name: "Add card to Ready next" });
  await addCardBtn.scrollIntoViewIfNeeded();
  await addCardBtn.click();
  await column.getByLabel("Card title").fill("Confirm sprint goal");
  await column.getByLabel("Card details").fill("Align with the team before planning.");
  await column.getByRole("button", { name: "Add card", exact: true }).click();
  await expect(column.getByRole("article", { name: "Confirm sprint goal" })).toBeVisible();

  const editBtn = column.getByRole("button", { name: "Edit Confirm sprint goal" });
  await editBtn.scrollIntoViewIfNeeded();
  await editBtn.click();
  await page.getByLabel("Title").fill("Confirm the sprint goal");
  await page.getByLabel("Details").fill("Share the final goal with the team.");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(column.getByRole("article", { name: "Confirm the sprint goal" })).toBeVisible();

  const deleteBtn = column.getByRole("button", { name: "Delete Confirm the sprint goal" });
  await deleteBtn.scrollIntoViewIfNeeded();
  await deleteBtn.click();
  await expect(column.getByRole("article", { name: "Confirm the sprint goal" })).toHaveCount(0);
});

test("moves a card between columns by drag and drop", async ({ page, isMobile }) => {
  test.skip(isMobile, "The desktop drag gesture is covered on the desktop project; mobile columns remain horizontally reachable.");
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await setupMockBoard(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Product sprint" })).toBeVisible();

  const source = page.getByRole("article", { name: "Map the onboarding flow" });
  const targetColumn = page.getByRole("region", { name: "Done column" });
  const target = targetColumn.getByRole("article", { name: "Set up project workspace" });
  await source.waitFor({ state: "visible" });
  await target.scrollIntoViewIfNeeded();
  const from = await source.boundingBox();
  const to = await target.boundingBox();
  if (!from || !to) throw new Error("Drag source or target was not visible");

  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 16 });
  await page.mouse.up();

  await expect(targetColumn.getByRole("article", { name: "Map the onboarding flow" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Backlog column" }).getByRole("article", { name: "Map the onboarding flow" })).toHaveCount(0);
  expect(pageErrors).toEqual([]);
});

test("restores the card when a drag is canceled", async ({ page, isMobile }) => {
  test.skip(isMobile, "The pointer cancellation flow is covered on desktop.");
  await setupMockBoard(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Product sprint" })).toBeVisible();

  const source = page.getByRole("article", { name: "Map the onboarding flow" });
  const targetColumn = page.getByRole("region", { name: "To do column" });
  await source.waitFor({ state: "visible" });
  await targetColumn.scrollIntoViewIfNeeded();
  const from = await source.boundingBox();
  const to = await targetColumn.boundingBox();
  if (!from || !to) throw new Error("Drag source or target was not visible");

  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x + to.width / 2, to.y + 70, { steps: 12 });
  await page.keyboard.press("Escape");
  await page.mouse.up();

  await expect(page.getByRole("region", { name: "Backlog column" }).getByRole("article", { name: "Map the onboarding flow" })).toBeVisible();
  await expect(targetColumn.getByRole("article", { name: "Map the onboarding flow" })).toHaveCount(0);
});

test("interacts with the AI assistant sidebar", async ({ page }) => {
  await setupMockBoard(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Product sprint" })).toBeVisible();

  await page.getByRole("button", { name: "Toggle AI assistant" }).click({ force: true });
  await expect(page.getByRole("heading", { name: "AI Assistant" })).toBeVisible();

  const input = page.getByPlaceholder("Ask me to add, edit, or move cards…");
  await input.fill("Please create a task to test deployment");
  await page.getByRole("button", { name: "Send" }).click();

  await expect(page.getByText("AI task completed successfully.")).toBeVisible();
  await page.getByRole("button", { name: "Close chat" }).click();
});

test("keeps all five columns reachable at mobile width", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile layout check");
  await setupMockBoard(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Product sprint" })).toBeVisible();

  const columns = page.locator(".board-columns");
  await expect(columns).toHaveCSS("overflow-x", "auto");
  for (const name of ["Backlog", "To do", "In progress", "Review", "Done"]) {
    const colBtn = page.getByRole("button", { name, exact: true });
    await colBtn.scrollIntoViewIfNeeded();
    await expect(colBtn).toHaveCount(1);
  }
});
