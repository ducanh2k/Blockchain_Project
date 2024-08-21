import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Deposit from './deposit.js'
import Withdraw from './withdraw.js'
import Transaction from './transaction.js'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  address: string | undefined

  @hasMany(() => Deposit)
  deposits!: HasMany<typeof Deposit>

  @hasMany(() => Withdraw)
  withdraws!: HasMany<typeof Withdraw>

  @hasMany(() => Transaction)
  transactions!: HasMany<typeof Transaction>
}
