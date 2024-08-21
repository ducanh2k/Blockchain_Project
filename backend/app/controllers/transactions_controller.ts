import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'

export default class TransactionsController {
  async deposit({ request, auth }: HttpContext) {
    const amount = request.input('amount')
    const user = (await auth.authenticate()) as unknown as User

    // Tạo một bản ghi duy nhất cho giao dịch deposit
    await user.related('transactions').create({
      type: 'deposit',
      amount,
      transactionTime: new Date(),
    })
  }

  async withdraw({ request, auth }: HttpContext) {
    const amount = request.input('amount')
    const user = (await auth.authenticate()) as unknown as User

    // Logic Withdraw
    await user.related('withdraws').create({
      amount,
      withdrawTime: new Date(),
    })

    // Tạo Transaction
    await user.related('transactions').create({
      type: 'withdraw',
      amount,
      transactionTime: new Date(),
    })
  }

  async getTransactionHistory({ auth }: HttpContext) {
    const user = (await auth.authenticate()) as unknown as User

    return await user.related('transactions').query().orderBy('transactionTime', 'desc')
  }
}
