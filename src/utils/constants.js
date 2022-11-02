import Utils from './index'

/**
 * 操作符的种类信息
 * @type 种类
 * @nb_inputs 输入框个数
 * @multiple 多个值
 * @apply_to 可应用到哪些规则
 */
export const operators = [
	{
		type: 'equal',
		nb_inputs: 1,
		multiple: false,
		apply_to: ['text', 'number', 'date', 'datetime', 'boolean']
	},
	{
		type: 'not_equal',
		nb_inputs: 1,
		multiple: false,
		apply_to: ['text', 'number', 'date', 'datetime', 'boolean']
	},
	{
		type: 'in',
		nb_inputs: 1,
		multiple: true,
		apply_to: ['text', 'number', 'date', 'datetime']
	},
	{
		type: 'not_in',
		nb_inputs: 1,
		multiple: true,
		apply_to: ['text', 'number', 'date', 'datetime']
	},
	{
		type: 'less',
		nb_inputs: 1,
		multiple: false,
		apply_to: ['number', 'date', 'datetime']
	},
	{
		type: 'less_or_equal',
		nb_inputs: 1,
		multiple: false,
		apply_to: ['number', 'date', 'datetime']
	},
	{
		type: 'greater',
		nb_inputs: 1,
		multiple: false,
		apply_to: ['number', 'date', 'datetime']
	},
	{
		type: 'greater_or_equal',
		nb_inputs: 1,
		multiple: false,
		apply_to: ['number', 'date', 'datetime']
	},
	{
		type: 'between',
		nb_inputs: 2,
		multiple: false,
		apply_to: ['number', 'date', 'datetime']
	},
	{
		type: 'not_between',
		nb_inputs: 2,
		multiple: false,
		apply_to: ['number', 'date', 'datetime']
	},
	{ type: 'begins_with', nb_inputs: 1, multiple: false, apply_to: ['text'] },
	{
		type: 'not_begins_with',
		nb_inputs: 1,
		multiple: false,
		apply_to: ['text']
	},
	{ type: 'contains', nb_inputs: 1, multiple: false, apply_to: ['text'] },
	{ type: 'not_contains', nb_inputs: 1, multiple: false, apply_to: ['text'] },
	{ type: 'ends_with', nb_inputs: 1, multiple: false, apply_to: ['text'] },
	{
		type: 'not_ends_with',
		nb_inputs: 1,
		multiple: false,
		apply_to: ['text']
	},
	{ type: 'is_empty', nb_inputs: 0, multiple: false, apply_to: ['text'] },
	{ type: 'is_not_empty', nb_inputs: 0, multiple: false, apply_to: ['text'] },
	{
		type: 'is_null',
		nb_inputs: 0,
		multiple: false,
		apply_to: ['text', 'number', 'date', 'datetime', 'boolean']
	},
	{
		type: 'is_not_null',
		nb_inputs: 0,
		multiple: false,
		apply_to: ['text', 'number', 'date', 'datetime', 'boolean']
	}
]

/**
 * 根据类型获取操作符
 * @param {*} type 类型
 * @param {*} doThrow 是否要抛出错误
 * @returns 操作符
 */
export const getOperatorByType = function (type, doThrow) {
	console.log('type', type)
	if (type == '-1') {
		return null
	}

	for (let i = 0, l = operators.length; i < l; i++) {
		if (operators[i].type == type) {
			return operators[i]
		}
	}

	Utils.error(
		doThrow !== false,
		'UndefinedOperator',
		'Undefined operator "{0}"',
		type
	)

	return null
}

/**
 * 默认条件
 */
export const default_condition = 'AND'

/**
 * 操作符对应的 sql
 * @op sql操作符
 * @sep 分隔符
 */
export const sqlOperators = {
	equal: { op: '= ?' },
	not_equal: { op: '!= ?' },
	in: { op: 'IN(?)', sep: ', ' },
	not_in: { op: 'NOT IN(?)', sep: ', ' },
	less: { op: '< ?' },
	less_or_equal: { op: '<= ?' },
	greater: { op: '> ?' },
	greater_or_equal: { op: '>= ?' },
	between: { op: 'BETWEEN ?', sep: ' AND ' },
	not_between: { op: 'NOT BETWEEN ?', sep: ' AND ' },
	begins_with: { op: 'LIKE ?', mod: '{0}%', escape: '%_' },
	not_begins_with: { op: 'NOT LIKE ?', mod: '{0}%', escape: '%_' },
	contains: { op: 'LIKE ?', mod: '%{0}%', escape: '%_' },
	not_contains: { op: 'NOT LIKE ?', mod: '%{0}%', escape: '%_' },
	ends_with: { op: 'LIKE ?', mod: '%{0}', escape: '%_' },
	not_ends_with: { op: 'NOT LIKE ?', mod: '%{0}', escape: '%_' },
	is_empty: { op: "= ''" },
	is_not_empty: { op: "!= ''" },
	is_null: { op: 'IS NULL' },
	is_not_null: { op: 'IS NOT NULL' }
}

/**
 * sql规则操作符函数
 */
export const sqlRuleOperator = {
	'=': function (v) {
		return {
			val: v,
			op: v === '' ? 'is_empty' : 'equal'
		}
	},
	'!=': function (v) {
		return {
			val: v,
			op: v === '' ? 'is_not_empty' : 'not_equal'
		}
	},
	LIKE: function (v) {
		if (v.slice(0, 1) == '%' && v.slice(-1) == '%') {
			return {
				val: v.slice(1, -1),
				op: 'contains'
			}
		} else if (v.slice(0, 1) == '%') {
			return {
				val: v.slice(1),
				op: 'ends_with'
			}
		} else if (v.slice(-1) == '%') {
			return {
				val: v.slice(0, -1),
				op: 'begins_with'
			}
		} else {
			Utils.error('SQLParse', 'Invalid value for LIKE operator "{0}"', v)
		}
	},
	'NOT LIKE': function (v) {
		if (v.slice(0, 1) == '%' && v.slice(-1) == '%') {
			return {
				val: v.slice(1, -1),
				op: 'not_contains'
			}
		} else if (v.slice(0, 1) == '%') {
			return {
				val: v.slice(1),
				op: 'not_ends_with'
			}
		} else if (v.slice(-1) == '%') {
			return {
				val: v.slice(0, -1),
				op: 'not_begins_with'
			}
		} else {
			Utils.error('SQLParse', 'Invalid value for NOT LIKE operator "{0}"', v)
		}
	},
	IN: function (v) {
		return { val: v, op: 'in' }
	},
	'NOT IN': function (v) {
		return { val: v, op: 'not_in' }
	},
	'<': function (v) {
		return { val: v, op: 'less' }
	},
	'<=': function (v) {
		return { val: v, op: 'less_or_equal' }
	},
	'>': function (v) {
		return { val: v, op: 'greater' }
	},
	'>=': function (v) {
		return { val: v, op: 'greater_or_equal' }
	},
	BETWEEN: function (v) {
		return { val: v, op: 'between' }
	},
	'NOT BETWEEN': function (v) {
		return { val: v, op: 'not_between' }
	},
	IS: function (v) {
		if (v !== null) {
			Utils.error('SQLParse', 'Invalid value for IS operator')
		}
		return { val: null, op: 'is_null' }
	},
	'IS NOT': function (v) {
		if (v !== null) {
			Utils.error('SQLParse', 'Invalid value for IS operator')
		}
		return { val: null, op: 'is_not_null' }
	}
}

/**
 * sql语句
 */
export const sqlStatements = {
	question_mark: function () {
		var params = []
		return {
			add: function (rule, value) {
				params.push(value)
				return '?'
			},
			run: function () {
				return params
			}
		}
	},

	numbered: function (char) {
		if (!char || char.length > 1) char = '$'
		var index = 0
		var params = []
		return {
			add: function (rule, value) {
				params.push(value)
				index++
				return char + index
			},
			run: function () {
				return params
			}
		}
	},

	named: function (char) {
		if (!char || char.length > 1) char = ':'
		var indexes = {}
		var params = {}
		return {
			add: function (rule, value) {
				if (!indexes[rule.field]) indexes[rule.field] = 1
				var key = rule.field + '_' + indexes[rule.field]++
				params[key] = value
				return char + key
			},
			run: function () {
				return params
			}
		}
	}
}

/**
 * sql规则语句
 */
export const sqlRuleStatement = {
	question_mark: function (values) {
		var index = 0
		return {
			parse: function (v) {
				return v == '?' ? values[index++] : v
			},
			esc: function (sql) {
				return sql.replace(/\?/g, "'?'")
			}
		}
	},

	numbered: function (values, char) {
		if (!char || char.length > 1) char = '$'
		var regex1 = new RegExp('^\\' + char + '[0-9]+$')
		var regex2 = new RegExp('\\' + char + '([0-9]+)', 'g')
		return {
			parse: function (v) {
				return regex1.test(v) ? values[v.slice(1) - 1] : v
			},
			esc: function (sql) {
				return sql.replace(regex2, "'" + (char == '$' ? '$$' : char) + "$1'")
			}
		}
	},

	named: function (values, char) {
		if (!char || char.length > 1) char = ':'
		var regex1 = new RegExp('^\\' + char)
		var regex2 = new RegExp(
			'\\' + char + '(' + Object.keys(values).join('|') + ')\\b',
			'g'
		)
		return {
			parse: function (v) {
				return regex1.test(v) ? values[v.slice(1)] : v
			},
			esc: function (sql) {
				return sql.replace(regex2, "'" + (char == '$' ? '$$' : char) + "$1'")
			}
		}
	}
}
