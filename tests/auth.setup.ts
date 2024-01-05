import { test as setup } from '@playwright/test' ;

const authFile = '.auth/user.json'

setup ('authentification', async({page}) => {
await page.goto('https://angular.realworld.how/'); //Эта строка переходит на указанный веб-сайт https://angular.realworld.io/, который будет использоваться для выполнения тестов.
   await page.getByText('Sign in').click()
   await page.getByRole('textbox', {name: "Email"}).fill('shadowpn+2@gmail.com')
   await page.getByRole('textbox', {name: "Password"}).fill('nata_1982')
   await page.getByRole('button').click()
   await page.waitForResponse('https://api.realworld.io/api/tags')

   await page.context().storageState({path: authFile})
})