import { expect, test } from "@playwright/test";

test("opens with a populated five-column sprint board", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Product sprint" })).toBeVisible();
  for (const name of ["Backlog", "To do", "In progress", "Review", "Done"]) {
    await expect(page.getByRole("region", { name: `${name} column` })).toBeVisible();
  }
  await expect(page.getByRole("article", { name: "Map the onboarding flow" })).toBeVisible();
});

test("renames a column and adds, edits, and deletes a card", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "To do", exact: true }).click();
  const renameInput = page.getByLabel("Column name");
  await renameInput.fill("Ready next");
  await page.getByRole("heading", { name: "Product sprint" }).click();
  const column = page.getByRole("region", { name: "Ready next column" });

  await column.getByRole("button", { name: "Add card to Ready next" }).click();
  await column.getByLabel("Card title").fill("Confirm sprint goal");
  await column.getByLabel("Card details").fill("Align with the team before planning.");
  await column.getByRole("button", { name: "Add card", exact: true }).click();
  await expect(column.getByRole("article", { name: "Confirm sprint goal" })).toBeVisible();

  await column.getByRole("button", { name: "Edit Confirm sprint goal" }).click();
  await page.getByLabel("Title").fill("Confirm the sprint goal");
  await page.getByLabel("Details").fill("Share the final goal with the team.");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(column.getByRole("article", { name: "Confirm the sprint goal" })).toBeVisible();

  await column.getByRole("button", { name: "Delete Confirm the sprint goal" }).click();
  await expect(column.getByRole("article", { name: "Confirm the sprint goal" })).toHaveCount(0);
});

test("moves a card between columns by drag and drop", async ({ page, isMobile }) => {
  test.skip(isMobile, "The desktop drag gesture is covered on the desktop project; mobile columns remain horizontally reachable.");
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto("/");
  const source = page.getByRole("article", { name: "Map the onboarding flow" });
  const targetColumn = page.getByRole("region", { name: "Done column" });
  const target = targetColumn.getByRole("article", { name: "Set up project workspace" });
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
  await page.goto("/");
  const source = page.getByRole("article", { name: "Map the onboarding flow" });
  const targetColumn = page.getByRole("region", { name: "To do column" });
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

test("keeps all five columns reachable at mobile width", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile layout check");
  await page.goto("/");
  const columns = page.locator(".board-columns");
  await expect(columns).toHaveCSS("overflow-x", "auto");
  for (const name of ["Backlog", "To do", "In progress", "Review", "Done"]) {
    await expect(page.getByRole("button", { name, exact: true })).toHaveCount(1);
  }
});
