import { test, expect, request } from '@playwright/test'
import tags from '../test-data/tags.json'

test.beforeEach( async({page}) => { //Это блок кода, который выполняется перед каждым тестом. Он определяет, какие маршруты будут перехвачены во время тестов.
  await page.route ('*/**/api/tags', async route => { // Здесь устанавливается маршрут для URL, соответствующего */**/api/tags. Это означает, что все запросы к этому URL будут перехвачены и обработаны внутри асинхронной функции route. В данном случае, она перехватывает запрос и возвращает JSON-содержимое из файла tags.json.
  await route.fulfill({
      body: JSON.stringify(tags)
       })
    })
  
   await page.goto('https://angular.realworld.how/'); //Эта строка переходит на указанный веб-сайт https://angular.realworld.io/, который будет использоваться для выполнения тестов.
   
  })

test('has title', async ({ page }) => {
  await page.route('*/**/api/articles?limit=10&offset=0', async route => { //Здесь устанавливается маршрут для URL */**/api/articles?limit=10&offset=0, что также перехватывает запросы к этому URL и обрабатывает их. Внутри функции route изменяется некоторое поле в ответе JSON.
    const response = await route.fetch()
    const responseBody = await response.json()
    responseBody.articles[0].title = "This is a MOCK test title"
    responseBody.articles[0].description  = "This is a MOCK description"

    await route.fulfill({
      body: JSON.stringify(responseBody)
    })
  })
  await page.getByText('Global Feed').click()
  await expect(page.locator('.navbar-brand')).toHaveText('conduit') //Здесь ожидается, что элемент с классом .navbar-brand на странице должен иметь текст "conduit".
  await expect(page.locator('app-article-list h1').first()).toContainText('This is a MOCK test title') // Здесь ожидается, что первый заголовок h1 внутри элемента app-article-list на странице должен содержать текст "This is a test title".
  await expect(page.locator('app-article-list p').first()).toContainText('This is a MOCK description') //Здесь ожидается, что первый абзац p внутри элемента app-article-list на странице должен содержать текст "This is a description".
})

test('Delete article', async ({page, request}) => {
  
  const articleResponse = await request.post('https://api.realworld.io/api/articles/', {
    data:{
      "article":{
                "tagList":[], 
                "title": "This is test article", 
                "description": "This is test description", 
                "body": "This a test body"}
              }
   
  })
  expect(articleResponse.status()).toEqual(201)
  await page.getByText('Global Feed').click()
  await page.getByText('This is test article').click()
  await page.getByRole('button', {name: "Delete Article"}).first().click()
  await page.getByText('Global Feed').click()
  
  await expect(page.locator('app-article-list h1').first()).not.toContainText('This is test article')
})

test('create article', async({page, request}) => {
  await page.getByText('New Article').click()
  await page.getByRole('textbox', {name:'Article Title'}).fill('Playwright is awesome')
  await page.getByRole('textbox', {name:'What\'s this article about?'}).fill('About thePlaywright')
  await page.getByRole('textbox', {name:'Write your article (in markdown)'}).fill('we like to use Playwright for automation')
  await page.getByRole('button', {name:'Publish Article'}).click()
  const articleResponse = await page.waitForResponse('https://api.realworld.io/api/articles/')
  const articleResponseBody = await articleResponse.json()
  const slugId = articleResponseBody.article.slug


  await expect(page.locator('.article-page h1')).toContainText('Playwright is awesome')

  await page.getByText('Home').click()
  await page.getByText('Global Feed').click()
  await expect(page.locator('app-article-list h1').first()).toContainText('Playwright is awesome')
  
  const deleteArticleResponse = await request.delete(`https://api.realworld.io/api/articles/${slugId}`)
  
  expect(deleteArticleResponse.status()).toEqual(204)

  await page.reload()

})
