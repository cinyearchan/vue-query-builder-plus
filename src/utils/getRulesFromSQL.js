import Utils, { getStmtConfig, isPlainObject, getSQLFieldID } from './index'
import {
	default_condition,
	sqlOperators,
	sqlRuleOperator,
	sqlRuleStatement
} from './constants'
import SQLParser from 'sql-parser-mistic'

/**
 * Convert a SQL query to rules
 * @param {string|module:plugins.SqlSupport.SqlQuery} query
 * @param {boolean|string} stmt
 * @param {Array} rules 传入的主规则
 * @returns {object}
 */
export const getRulesFromSQL = (query, stmt, rules) => {
	if (typeof query == 'string') {
		query = { sql: query }
	}

	if (stmt === true) stmt = 'question_mark'
	if (typeof stmt == 'string') {
		let config = getStmtConfig(stmt)
		stmt = sqlRuleStatement[config[1]](query.params, config[2])
	}

	if (stmt) {
		query.sql = stmt.esc(query.sql)
	}

	if (query.sql.toUpperCase().indexOf('SELECT') !== 0) {
		query.sql = 'SELECT * FROM table WHERE ' + query.sql
	}

	// console.log('parser', SQLParser)
	// 得到 sql 语句的抽象语法树 ast
	let parsed = SQLParser.parse(query.sql)
	console.log('parsed', parsed)

	if (!parsed.where) {
		Utils.error('SQLParse', 'No WHERE clause found')
	}

	// let data = self.change('parseSQLNode', parsed.where.conditions)
	let data = parsed.where.conditions

	// a plugin returned a group
	if ('rules' in data && 'condition' in data) {
		return data
	}

	// a plugin returned a rule
	if ('id' in data && 'operator' in data && 'value' in data) {
		return {
			condition: default_condition,
			rules: [data]
		}
	}

	// create root group
	// let out = self.change(
	// 	'sqlToGroup',
	// 	{
	// 		condition: default_condition,
	// 		rules: []
	// 	},
	// 	data
	// )
	// @TODO 这里暂时跳过处理 sql NOT function
	let out = Object.assign({}, { condition: default_condition, rules: [] })

	// keep track of current group
	let curr = out

	;(function flatten(data, i) {
		if (data === null) {
			return
		}

		// allow plugins to manually parse or handle special cases
		// data = self.change('parseSQLNode', data)
		// @TODO 暂时跳过处理 sql NOT function
		data = Object.assign({}, data)

		// a plugin returned a group
		if ('rules' in data && 'condition' in data) {
			curr.rules.push(data)
			return
		}

		// a plugin returned a rule
		if ('id' in data && 'operator' in data && 'value' in data) {
			curr.rules.push(data)
			return
		}

		// data must be a SQL parser node
		if (!('left' in data) || !('right' in data) || !('operation' in data)) {
			Utils.error('SQLParse', 'Unable to parse WHERE clause')
		}

		// it's a node
		if (['AND', 'OR'].indexOf(data.operation.toUpperCase()) !== -1) {
			// let createGroup = self.change(
			// 	// 事件名
			// 	'sqlGroupDistinct',
			// 	// 传递给事件构造器的 event.value
			// 	i > 0 && curr.condition != data.operation.toUpperCase(),
			// 	// 以下是事件触发时要用到的参数
			// 	curr,
			// 	data,
			// 	i
			// )
			// createGroup ==> i > 0 && curr.condition != data.operation.toUpperCase() 以及 trigger['sqlGroupDistinct'](curr, data, i)
			// 在不处理 Not function 时，createGroup 只和 i > 0 && curr.condition != data.operation.toUpperCase() 有关
			let createGroup = i > 0 && curr.condition != data.operation.toUpperCase()
			console.warn(
				'createGroup',
				createGroup,
				curr.condition,
				data.operation,
				i
			)

			if (createGroup) {
				// let group = self.change(
				// 	// event.name
				// 	'sqlToGroup',
				// 	// event.value
				// 	{
				// 		condition: default_condition,
				// 		rules: []
				// 	},
				// 	// 事件触发的参数
				// 	data
				// )
				// @TODO 暂时不处理 NOT function
				let group = Object.assign(
					{},
					{ condition: default_condition, rules: [] }
				)

				curr.rules.push(group)
				curr = group
			}

			curr.condition = data.operation.toUpperCase()
			i++

			// some magic!
			let next = curr
			flatten(data.left, i)

			curr = next
			flatten(data.right, i)
		} else {
			// it's a leaf
			if (isPlainObject(data.right.value)) {
				Utils.error(
					'SQLParse',
					'Value format not supported for {0}',
					data.left.value
				)
			}

			// convert array
			let value
			if (Array.isArray(data.right.value)) {
				value = data.right.value.map(v => v.value)
			} else {
				value = data.right.value
			}

			// get actual values
			if (stmt) {
				if (Array.isArray(value)) {
					value = value.map(stmt.parse)
				} else {
					value = stmt.parse(value)
				}
			}

			// convert operator
			let operator = data.operation.toUpperCase()
			if (operator == '<>') {
				operator = '!='
			}

			let sqlrl = sqlRuleOperator[operator]
			if (sqlrl == undefined) {
				Utils.error(
					'UndefinedSQLOperator',
					'Invalid SQL operation "{0}".',
					data.operation
				)
			}

			// let opVal = sqlrl.call(this, value, data.operation)
			let opVal = sqlrl(value)

			// find field name
			let field
			if ('values' in data.left) {
				field = data.left.values.join('.')
			} else if ('value' in data.left) {
				field = data.left.value
			} else {
				Utils.error(
					'SQLParse',
					'Cannot find field name in {0}',
					JSON.stringify(data.left)
				)
			}

			// unescape chars declared by the operator
			let finalValue = opVal.val
			let sql = sqlOperators[opVal.op]
			if (!stmt && sql && sql.escape) {
				var searchChars = sql.escape
					.split('')
					.map(function (c) {
						return '\\\\' + c
					})
					.join('|')
				finalValue = finalValue.replace(
					new RegExp('(' + searchChars + ')', 'g'),
					function (s) {
						return s[1]
					}
				)
			}

			let id = getSQLFieldID(field, value, rules)

			// 这里的数据字段需要修改成当前版本的
			// let rule = self.change(
			// 	'sqlToRule',
			// 	{
			// 		id: id,
			// 		field: field,
			// 		operator: opVal.op,
			// 		value: finalValue
			// 	},
			// 	data
			// )
			// sqlToRule 这里触发了事件，但却没有设置任何相关的监听函数
			let rule = Object.assign(
				{},
				{
					id: id,
					field: field, // field 字段需要修改
					rule: field,
					operator: opVal.op,
					value: finalValue
				}
			)

			curr.rules.push(rule)
		}
	})(data, 0)

	return out
}
