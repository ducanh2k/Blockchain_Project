import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class Withdraw extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare amount: number

  @column()
  declare withdrawTime: Date

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
