import { test, expect } from '@playwright/test';
import tags from '../test-data/tags.json'

test.beforeEach( async({page}) => { //Это блок кода, который выполняется перед каждым тестом. Он определяет, какие маршруты будут перехвачены во время тестов.
  await page.route ('*/**/api/tags', async route => { // Здесь устанавливается маршрут для URL, соответствующего */**/api/tags. Это означает, что все запросы к этому URL будут перехвачены и обработаны внутри асинхронной функции route. В данном случае, она перехватывает запрос и возвращает JSON-содержимое из файла tags.json.
    await route.fulfill({
      body: JSON.stringify(tags)
      })
  })
  await page.route('*/**/api/articles?limit=10&offset=0', async route => { //Здесь устанавливается маршрут для URL */**/api/articles?limit=10&offset=0, что также перехватывает запросы к этому URL и обрабатывает их. Внутри функции route изменяется некоторое поле в ответе JSON.
    const response = await route.fetch()
    const responseBody = await response.json()
    responseBody.articles[0].title = "This is a test title"
    responseBody.articles[0].description  = "This is a description"

    await route.fulfill({
      body: JSON.stringify(responseBody)
    })
  })
  await page.goto('https://angular.realworld.io/'); //Эта строка переходит на указанный веб-сайт https://angular.realworld.io/, который будет использоваться для выполнения тестов.
})

test('has title', async ({ page }) => {


  await expect(page.locator('.navbar-brand')).toHaveText('conduit') //Здесь ожидается, что элемент с классом .navbar-brand на странице должен иметь текст "conduit".
  await expect(page.locator('app-article-list h1').first()).toContainText('This is a test title') // Здесь ожидается, что первый заголовок h1 внутри элемента app-article-list на странице должен содержать текст "This is a test title".
  await expect(page.locator('app-article-list p').first()).toContainText('This is a description') //Здесь ожидается, что первый абзац p внутри элемента app-article-list на странице должен содержать текст "This is a description".
})
