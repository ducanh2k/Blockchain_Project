import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'deposits'

  async up() {
    this.schema.createTableIfNotExists(this.tableName, (table) => {
      table.increments('id')
      table.string('user_address').notNullable()
      table.bigInteger('amount').notNullable()
      table.timestamp('timestamp').notNullable()
      table.boolean('locked').notNullable()
      table.integer('apr').notNullable()
      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
