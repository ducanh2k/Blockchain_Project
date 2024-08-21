import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class ClaimReward extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  rewardAmount!: number

  @column()
  claimTime!: Date

  @belongsTo(() => User)
  user!: BelongsTo<typeof User>
}
