import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Transaction extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare user_id: number

  @column()
  declare type: 'deposit' | 'withdraw'

  @column()
  declare amount: number

  @column()
  declare transactionTime: Date

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
