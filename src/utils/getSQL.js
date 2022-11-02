import Utils, { getStmtConfig } from './index'
import {
	default_condition,
	getOperatorByType,
	sqlOperators,
	sqlStatements
} from './constants'

/**
 * 将 queryBuilder 生成的 json 转换成 sql 语句
 * @param {boolean|string} stmt 设置 use prepared statements: false, 'question_mark', 'numbered', 'numbered(@)', 'named', 'named(@)'
 * @param {boolean} [nl=false] new line 设置，\n 或者 " "
 * @param {object} data current rules by default
 * @returns {module:plugins.SqlSupport.SqlQuery}
 */
export const getSQL = (stmt, nl, data) => {
	if (!data) {
		return null
	}

	nl = nl ? '\n' : ' '

	// boolean 转为整型数字 this.getPluginOptions('sql-support', 'boolean_as_integer')
	let boolean_as_integer = true

	if (stmt === true) {
		stmt = 'question_mark'
	}

	if (typeof stmt == 'string') {
		let config = getStmtConfig(stmt)
		stmt = sqlStatements[config[1]](config[2])
	}

	// let self = this

	let sql = (function parse(group) {
		if (!group.condition) {
			// @TODO 这里需要修改
			group.condition = default_condition
		}

		if (['AND', 'OR'].indexOf(group.condition.toUpperCase()) === -1) {
			console.error(
				'UndefinedSQLCondition',
				'Unable to build SQL query with condition "{0}"',
				group.condition
			)
		}

		if (!group.rules) {
			return ''
		}

		let parts = []

		group.rules.forEach(rule => {
			if (rule.rules && rule.rules.length > 0) {
				parts.push('(' + nl + parse(rule) + nl + ')' + nl)
			} else {
				let sql = sqlOperators[rule.operator]
				let ope = getOperatorByType(rule.operator)
				let value = ''

				if (sql === undefined) {
					console.error(
						'UndefinedSQLOperator',
						'Unknown SQL operation for operator "{0}"',
						rule.operator
					)
				}

				if (ope.nb_inputs !== 0) {
					if (!(rule.value instanceof Array)) {
						rule.value = [rule.value]
					}

					rule.value.forEach((v, i) => {
						if (i > 0) {
							value += sql.sep
						}

						if (rule.type == 'boolean' && boolean_as_integer) {
							v = v ? 1 : 0
						} else if (
							!stmt &&
							rule.type !== 'integer' &&
							rule.type !== 'double' &&
							rule.type !== 'boolean'
						) {
							v = Utils.escapeString(v, sql.escape)
						}

						if (sql.mod) {
							v = Utils.fmt(sql.mod, v)
						}

						if (stmt) {
							value += stmt.add(rule, v)
						} else {
							if (typeof v == 'string') {
								v = "'" + v + "'"
							}

							value += v
						}
					})
				}
				const sqlFn = function (v) {
					return sql.op.replace('?', () => {
						return v
					})
				}

				// @TODO 触发事件 module:plugins.SqlSupport.changer:getSQLField
				// let field = self.change('getSQLField', rule.field, rule)
				// debugger
				// let field = rule.field
				let field = rule.rule
				// change 方法出现在 src/main.js 173 行 change: function(type, value) {}
				// var event = new $.Event() // 构造了一个自定义 jquery 事件
				// this.$el.triggerHandler 将传入的第二个以后的剩余参数传递给 triggerHandler
				// 返回 event.value
				// Triggers an event on the builder container and returns the modified value

				let ruleExpression = field + ' ' + sqlFn(value)

				// @TODO 触发事件 module:plugins.SqlSupport.changer:ruleToSQL
				// parts.push(self.change('ruleToSQL', ruleExpression, rule, value, sqlFn))
				parts.push(ruleExpression)
			}
		})

		let groupExpression = parts.join(' ' + group.condition + nl)

		// @TODO 触发事件 module:plugins.SqlSupport.changer:groupToSQL
		// return self.change('groupToSQL', groupExpression, group)
		return groupExpression
	})(data)

	// {module:plugins.SqlSupport.SqlQuery}
	return stmt ? { sql: sql, params: stmt.run() } : { sql: sql }
}
