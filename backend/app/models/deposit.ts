import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class Deposit extends BaseModel {
  @column({ isPrimary: true })
  id: number | undefined

  @column()
  amount!: number

  @column()
  depositTime!: Date

  @column()
  locked!: boolean

  @column()
  apr!: number

  @belongsTo(() => User)
  user!: BelongsTo<typeof User>
}
